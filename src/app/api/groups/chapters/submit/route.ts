import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "../../../../../util/db";
import {
  scanlationGroups,
  chapterSubmissions,
  series,
  chapters,
} from "../../../../../util/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

// Validation schema for chapter submission
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

    const formData = await request.formData();

    // Helper function to get form data with null handling
    const getFormValue = (key: string): string | null => {
      const value = formData.get(key);
      return value === null || value === "" ? null : (value as string);
    };

    // Extract and validate form data
    const data = {
      series_id: getFormValue("series_id") || "",
      chapter_number: getFormValue("chapter_number") || "",
      chapter_title: getFormValue("chapter_title"),
      release_notes: getFormValue("release_notes"),
      group_id: getFormValue("group_id") || "",
    };

    // Validate the data
    const validatedData = chapterSubmissionSchema.parse(data);

    // Verify that the group exists and is active
    const group = await db
      .select()
      .from(scanlationGroups)
      .where(eq(scanlationGroups.slug, validatedData.group_id))
      .limit(1);

    if (group.length === 0) {
      return NextResponse.json(
        { error: "Scanlation group not found" },
        { status: 404 }
      );
    }

    if (group[0].status !== "approved") {
      return NextResponse.json(
        { error: "Scanlation group is not approved for submissions" },
        { status: 403 }
      );
    }

    // Verify that the series exists
    const targetSeries = await db
      .select()
      .from(series)
      .where(eq(series.id, validatedData.series_id))
      .limit(1);

    if (targetSeries.length === 0) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    // Handle start and end images upload
    const startImage = formData.get("start_image") as File | null;
    const endImage = formData.get("end_image") as File | null;
    let startImageUrl: string | null = null;
    let endImageUrl: string | null = null;

    // Validate and upload start image
    if (startImage && startImage.size > 0) {
      if (startImage.size > 20 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Start image must be less than 20MB" },
          { status: 400 }
        );
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(startImage.type)) {
        return NextResponse.json(
          { error: "Start image must be JPG, PNG, WebP, or GIF" },
          { status: 400 }
        );
      }

      // Upload start image (placeholder for now)
      startImageUrl = `https://placeholder.com/start-${validatedData.series_id}-${validatedData.chapter_number}`;
    }

    // Validate and upload end image
    if (endImage && endImage.size > 0) {
      if (endImage.size > 20 * 1024 * 1024) {
        return NextResponse.json(
          { error: "End image must be less than 20MB" },
          { status: 400 }
        );
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(endImage.type)) {
        return NextResponse.json(
          { error: "End image must be JPG, PNG, WebP, or GIF" },
          { status: 400 }
        );
      }

      // Upload end image (placeholder for now)
      endImageUrl = `https://placeholder.com/end-${validatedData.series_id}-${validatedData.chapter_number}`;
    }

    // Handle chapter pages upload
    const chapterPages: File[] = [];
    const pageOrders: number[] = [];

    // Get all files with 'chapter_pages' key
    const allFormEntries = Array.from(formData.entries());
    const pageFiles = allFormEntries.filter(([key]) => key === "chapter_pages");

    if (pageFiles.length === 0) {
      return NextResponse.json(
        { error: "At least one chapter page is required" },
        { status: 400 }
      );
    }

    // Process each page file
    pageFiles.forEach(([_, file], index) => {
      if (file instanceof File) {
        // Validate file
        if (file.size > 20 * 1024 * 1024) {
          // 20MB limit per file
          throw new Error(`Page ${index + 1} exceeds 20MB limit`);
        }

        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(
            `Page ${index + 1} must be an image file (JPG, PNG, GIF, WebP)`
          );
        }

        chapterPages.push(file);
        pageOrders.push(index);
      }
    });

    if (chapterPages.length === 0) {
      return NextResponse.json(
        { error: "No valid image files found" },
        { status: 400 }
      );
    }

    // Check for duplicate chapter in both chapters and submissions tables
    const [existingChapter, existingSubmission] = await Promise.all([
      db
        .select()
        .from(chapters)
        .where(
          and(
            eq(chapters.series_id, validatedData.series_id),
            eq(chapters.chapter_number, validatedData.chapter_number),
            eq(chapters.publisher, group[0].name)
          )
        )
        .limit(1),
      db
        .select()
        .from(chapterSubmissions)
        .where(
          and(
            eq(chapterSubmissions.series_id, validatedData.series_id),
            eq(chapterSubmissions.chapter_number, validatedData.chapter_number),
            eq(chapterSubmissions.status, "pending")
          )
        )
        .limit(1),
    ]);

    if (existingChapter.length > 0) {
      return NextResponse.json(
        {
          error: `Chapter ${validatedData.chapter_number} already exists for this series`,
        },
        { status: 409 }
      );
    }

    if (existingSubmission.length > 0) {
      return NextResponse.json(
        {
          error: `Chapter ${validatedData.chapter_number} is already pending review for this series`,
        },
        { status: 409 }
      );
    }

    // Here you would implement your file upload logic for chapter pages
    // For example, upload to cloud storage (AWS S3, Cloudinary, etc.)
    const uploadedPageUrls: string[] = [];

    for (let i = 0; i < chapterPages.length; i++) {
      const file = chapterPages[i];
      // const pageUrl = await uploadChapterPage(file, validatedData.series_id, validatedData.chapter_number, i);

      // For now, we'll set placeholder URLs
      const pageUrl = `https://placeholder.com/chapter-${
        validatedData.series_id
      }-${validatedData.chapter_number}-page-${i + 1}`;
      uploadedPageUrls.push(pageUrl);
    }

    // Create the chapter submission record
    const [submission] = await db
      .insert(chapterSubmissions)
      .values({
        series_id: validatedData.series_id,
        chapter_number: validatedData.chapter_number,
        chapter_title: validatedData.chapter_title || null,
        release_notes: validatedData.release_notes || null,
        page_count: chapterPages.length,
        page_urls: JSON.stringify(uploadedPageUrls), // Store as JSON array
        start_image_url: startImageUrl,
        end_image_url: endImageUrl,
        group_id: group[0].id,
        submitted_by_user: session.user.id,
        status: "pending",
      })
      .returning({
        id: chapterSubmissions.id,
        series_id: chapterSubmissions.series_id,
        chapter_number: chapterSubmissions.chapter_number,
        created_at: chapterSubmissions.created_at,
      });

    // Optionally send notification to admins
    // await notifyAdminsOfNewChapterSubmission(submission);

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
    });
  } catch (error) {
    console.error("Error processing chapter submission:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
