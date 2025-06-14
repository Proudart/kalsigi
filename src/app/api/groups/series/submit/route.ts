import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from '../../../../../util/db';
import { scanlationGroups, seriesSubmissions, series } from '../../../../../util/schema';
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { generateR2Paths, convertToWebP, uploadToR2 } from '@/lib/r2';
import { uploadRateLimiters, checkDualRateLimit, formatRateLimitHeaders } from '@/lib/rate-limit';

const seriesSubmissionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  alternative_titles: z.string().optional().nullable(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["ongoing", "completed", "hiatus", "cancelled"]),
  type: z.enum(["manga", "manhwa", "manhua", "webtoon", "novel"]),
  genres: z.string().min(1, "At least one genre is required"),
  author: z.string().optional().nullable(),
  artist: z.string().optional().nullable(),
  release_year: z.string().optional().nullable(),
  source_url: z.string().url().optional().nullable().or(z.literal("")).or(z.literal(null)),
  group_id: z.string().min(1, "Group ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting check
    const rateLimitCheck = checkDualRateLimit(
      request,
      uploadRateLimiters.seriesSubmission,
      uploadRateLimiters.seriesSubmissionByIp,
      session.user.id
    );

    if (rateLimitCheck.isBlocked) {
      const headers = formatRateLimitHeaders(
        rateLimitCheck.userLimit.isLimited ? rateLimitCheck.userLimit : rateLimitCheck.ipLimit
      );
      
      const message = rateLimitCheck.userLimit.isLimited 
        ? `Too many series submissions. You can submit ${rateLimitCheck.userLimit.remaining} more series today.`
        : 'Too many series submissions from this IP address. Please try again later.';
      
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
      return value === null || value === '' ? null : value as string;
    };
    
    const data = {
      title: getFormValue("title") || "",
      alternative_titles: getFormValue("alternative_titles"),
      description: getFormValue("description") || "",
      status: getFormValue("status") || "",
      type: getFormValue("type") || "",
      genres: getFormValue("genres") || "",
      author: getFormValue("author"),
      artist: getFormValue("artist"),
      release_year: getFormValue("release_year"),
      source_url: getFormValue("source_url"),
      group_id: getFormValue("group_id") || "",
    };

    const validatedData = seriesSubmissionSchema.parse(data);

    const cleanUrl = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s\-*]/g, '')
      .replace(/\s+/g, '-')
      .replace(/\*+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Verify group exists and is approved
    const group = await db
      .select()
      .from(scanlationGroups)
      .where(eq(scanlationGroups.slug, validatedData.group_id))
      .limit(1);

    if (group.length === 0) {
      return NextResponse.json({ error: "Scanlation group not found" }, { status: 404 });
    }

    if (group[0].status !== 'approved') {
      return NextResponse.json({ error: "Scanlation group is not approved for submissions" }, { status: 403 });
    }
    
    // Handle cover image upload with R2
    const coverImage = formData.get("cover_image") as File | null;
    let coverImageUrl: string | null = null;
    let coverImagePath: string | null = null;
    
    if (coverImage && coverImage.size > 0) {
      // Validate file
      if (coverImage.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Cover image must be less than 10MB" }, { status: 400 });
      }
      
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(coverImage.type)) {
        return NextResponse.json({ error: "Cover image must be JPG, PNG, WebP, or GIF" }, { status: 400 });
      }

      // Generate R2 paths
      const paths = generateR2Paths('series', validatedData.group_id, cleanUrl);
      
      // Convert to WebP and upload to pending location
      const buffer = Buffer.from(await coverImage.arrayBuffer());
      const webpBuffer = await convertToWebP(buffer, 'cover');
      coverImageUrl = await uploadToR2(paths.pending, webpBuffer);
      coverImagePath = paths.pending; // Store path for later approval process
    }

    // Check for duplicates
    const [existingSeries, existingSubmission] = await Promise.all([
      db.select().from(series).where(eq(series.title, validatedData.title)).limit(1),
      db.select().from(seriesSubmissions)
        .where(and(
          eq(seriesSubmissions.title, validatedData.title),
          eq(seriesSubmissions.submission_status, 'pending')
        ))
        .limit(1)
    ]);

    if (existingSeries.length > 0) {
      return NextResponse.json({ error: "A series with this title already exists" }, { status: 409 });
    }

    if (existingSubmission.length > 0) {
      return NextResponse.json({ error: "A submission with this title is already pending review" }, { status: 409 });
    }

    // Create submission record
    const insertValues: any = {
      title: validatedData.title,
      description: validatedData.description,
      status: validatedData.status,
      type: validatedData.type,
      genres: validatedData.genres,
      group_id: group[0].id,
      submission_status: 'pending',
      submitted_by_user: session.user.id,
      series_url: cleanUrl, // Store for approval process
    };

    // Add optional fields
    if (validatedData.alternative_titles) insertValues.alternative_titles = validatedData.alternative_titles;
    if (validatedData.author) insertValues.author = validatedData.author;
    if (validatedData.artist) insertValues.artist = validatedData.artist;
    if (validatedData.release_year) insertValues.release_year = validatedData.release_year;
    if (validatedData.source_url) insertValues.source_url = validatedData.source_url;
    if (coverImageUrl) insertValues.cover_image_url = coverImageUrl;
    if (coverImagePath) insertValues.cover_image_path = coverImagePath; // Store R2 path

    const [submission] = await db
      .insert(seriesSubmissions)
      .values(insertValues)
      .returning({
        id: seriesSubmissions.id,
        title: seriesSubmissions.title,
        created_at: seriesSubmissions.created_at,
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
      message: "Series submitted successfully and is pending review",
      submission: {
        id: submission.id,
        title: submission.title,
        submittedAt: submission.created_at,
        coverUrl: coverImageUrl,
      },
      rateLimit: {
        userRemaining: rateLimitCheck.userLimit.remaining - 1,
        ipRemaining: rateLimitCheck.ipLimit.remaining - 1,
      },
    }, {
      headers: rateLimitHeaders,
    });

  } catch (error) {
    console.error("Error processing series submission:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
