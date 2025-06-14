import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "../../../../../util/db";
import { scanlationGroups, chapterSubmissions, series, chapters } from "../../../../../util/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { generateR2Paths, convertToWebP, uploadToR2 } from '@/lib/r2';
import { uploadRateLimiters, checkDualRateLimit, formatRateLimitHeaders, createRateLimitResponse } from '@/lib/rate-limit';

const chapterSubmissionSchema = z.object({
  series_id: z.string().uuid("Invalid series ID"),
  chapter_number: z.string().min(1, "Chapter number is required"),
  chapter_title: z.string().optional().nullable(),
  release_notes: z.string().optional().nullable(),
  group_id: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting check
    const rateLimitCheck = checkDualRateLimit(
      request,
      uploadRateLimiters.chapterUpload,
      uploadRateLimiters.chapterUploadByIp,
      session.user.id
    );

    if (rateLimitCheck.isBlocked) {
      const headers = formatRateLimitHeaders(
        rateLimitCheck.userLimit.isLimited ? rateLimitCheck.userLimit : rateLimitCheck.ipLimit
      );
      
      const message = rateLimitCheck.userLimit.isLimited 
        ? `Too many chapter uploads. You can upload ${uploadRateLimiters.chapterUpload.check(request).remaining} more chapters in the next hour.`
        : 'Too many chapter uploads from this IP address. Please try again later.';
      
      return new NextResponse(
        JSON.stringify({ 
          error: message,
          type: 'RATE_LIMIT_EXCEEDED',
          userRemaining: rateLimitCheck.userLimit.remaining,
          ipRemaining: rateLimitCheck.ipLimit.remaining
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }
      );
    }

    const formData = await request.formData();

    const getFormValue = (key: string): string | null => {
      const value = formData.get(key);
      return value === null || value === "" ? null : (value as string);
    };

    const data = {
      series_id: getFormValue("series_id") || "",
      chapter_number: getFormValue("chapter_number") || "",
      chapter_title: getFormValue("chapter_title"),
      release_notes: getFormValue("release_notes"),
      group_id: getFormValue("group_id") || "",
    };

    const validatedData = chapterSubmissionSchema.parse(data);

    // Verify group and series
    const [group, targetSeries] = await Promise.all([
      db.select().from(scanlationGroups).where(eq(scanlationGroups.slug, validatedData.group_id)).limit(1),
      db.select().from(series).where(eq(series.id, validatedData.series_id)).limit(1)
    ]);

    if (group.length === 0) {
      return NextResponse.json({ error: "Scanlation group not found" }, { status: 404 });
    }

    if (group[0].status !== "approved") {
      return NextResponse.json({ error: "Scanlation group is not approved for submissions" }, { status: 403 });
    }

    if (targetSeries.length === 0) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    if (!targetSeries[0].url) {
      return NextResponse.json({ error: "Series URL is missing" }, { status: 400 });
    }

    // Generate R2 paths for chapter
    const paths = generateR2Paths('chapter', validatedData.group_id, targetSeries[0].url, validatedData.chapter_number);

    // Handle start and end images
    const startImage = formData.get("start_image") as File | null;
    const endImage = formData.get("end_image") as File | null;
    let startImageUrl: string | null = null;
    let endImageUrl: string | null = null;

    if (startImage && startImage.size > 0) {
      if (startImage.size > 20 * 1024 * 1024) {
        return NextResponse.json({ error: "Start image must be less than 20MB" }, { status: 400 });
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(startImage.type)) {
        return NextResponse.json({ error: "Start image must be JPG, PNG, WebP, or GIF" }, { status: 400 });
      }

      // Upload start image
      const buffer = Buffer.from(await startImage.arrayBuffer());
      const webpBuffer = await convertToWebP(buffer, 'extra');
      const startKey = `${paths.pending}/start.webp`;
      startImageUrl = await uploadToR2(startKey, webpBuffer);
    }

    if (endImage && endImage.size > 0) {
      if (endImage.size > 20 * 1024 * 1024) {
        return NextResponse.json({ error: "End image must be less than 20MB" }, { status: 400 });
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(endImage.type)) {
        return NextResponse.json({ error: "End image must be JPG, PNG, WebP, or GIF" }, { status: 400 });
      }

      // Upload end image
      const buffer = Buffer.from(await endImage.arrayBuffer());
      const webpBuffer = await convertToWebP(buffer, 'extra');
      const endKey = `${paths.pending}/end.webp`;
      endImageUrl = await uploadToR2(endKey, webpBuffer);
    }

    // Handle chapter pages
    const chapterPages: File[] = [];
    const allFormEntries = Array.from(formData.entries());
    const pageFiles = allFormEntries.filter(([key]) => key === "chapter_pages");

    if (pageFiles.length === 0) {
      return NextResponse.json({ error: "At least one chapter page is required" }, { status: 400 });
    }

    // Validate page files
    pageFiles.forEach(([_, file], index) => {
      if (file instanceof File) {
        if (file.size > 20 * 1024 * 1024) {
          throw new Error(`Page ${index + 1} exceeds 20MB limit`);
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Page ${index + 1} must be an image file (JPG, PNG, GIF, WebP)`);
        }

        chapterPages.push(file);
      }
    });

    if (chapterPages.length === 0) {
      return NextResponse.json({ error: "No valid image files found" }, { status: 400 });
    }

    // Check for duplicates
    const [existingChapter, existingSubmission] = await Promise.all([
      db.select().from(chapters).where(and(
        eq(chapters.series_id, validatedData.series_id),
        eq(chapters.chapter_number, validatedData.chapter_number),
        eq(chapters.publisher, group[0].name)
      )).limit(1),
      db.select().from(chapterSubmissions).where(and(
        eq(chapterSubmissions.series_id, validatedData.series_id),
        eq(chapterSubmissions.chapter_number, validatedData.chapter_number),
        eq(chapterSubmissions.status, "pending")
      )).limit(1),
    ]);

    if (existingChapter.length > 0) {
      return NextResponse.json({
        error: `Chapter ${validatedData.chapter_number} already exists for this series`,
      }, { status: 409 });
    }

    if (existingSubmission.length > 0) {
      return NextResponse.json({
        error: `Chapter ${validatedData.chapter_number} is already pending review for this series`,
      }, { status: 409 });
    }

    // Upload chapter pages to R2
    const uploadedPageUrls: string[] = [];
    for (let i = 0; i < chapterPages.length; i++) {
      const file = chapterPages[i];
      const pageNumber = (i + 1).toString().padStart(3, '0');
      const pageKey = `${paths.pending}/${pageNumber}.webp`;
      
      const buffer = Buffer.from(await file.arrayBuffer());
      const webpBuffer = await convertToWebP(buffer, 'page');
      const pageUrl = await uploadToR2(pageKey, webpBuffer);
      uploadedPageUrls.push(pageUrl);
    }

    // Create chapter submission
    const [submission] = await db
      .insert(chapterSubmissions)
      .values({
        series_id: validatedData.series_id,
        chapter_number: validatedData.chapter_number,
        chapter_title: validatedData.chapter_title || null,
        release_notes: validatedData.release_notes || null,
        page_count: chapterPages.length,
        page_urls: JSON.stringify(uploadedPageUrls),
        start_image_url: startImageUrl,
        end_image_url: endImageUrl,
        group_id: group[0].id,
        submitted_by_user: session.user.id,
        status: "pending",
        pages_path: paths.pending, // Store R2 path for approval process
      })
      .returning({
        id: chapterSubmissions.id,
        series_id: chapterSubmissions.series_id,
        chapter_number: chapterSubmissions.chapter_number,
        created_at: chapterSubmissions.created_at,
      });

    // Increment rate limit counters on successful submission
    rateLimitCheck.userLimit.increment();
    rateLimitCheck.ipLimit.increment();

    // Add rate limit headers to successful response
    const rateLimitHeaders = {
      ...formatRateLimitHeaders(rateLimitCheck.userLimit),
      'X-RateLimit-Remaining-IP': rateLimitCheck.ipLimit.remaining.toString(),
    };

    return NextResponse.json({
      success: true,
      message: "Chapter submitted successfully and is pending review",
      submission: {
        id: submission.id,
        series_id: submission.series_id,
        chapter_number: submission.chapter_number,
        page_count: chapterPages.length,
        has_start_image: startImageUrl !== null,
        has_end_image: endImageUrl !== null,
        submitted_at: submission.created_at,
      },
      rateLimit: {
        userRemaining: rateLimitCheck.userLimit.remaining - 1,
        ipRemaining: rateLimitCheck.ipLimit.remaining - 1,
      },
    }, {
      headers: rateLimitHeaders,
    });
  } catch (error) {
    console.error("Error processing chapter submission:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error",
    }, { status: 500 });
  }
}
