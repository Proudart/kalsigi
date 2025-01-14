import { db } from "../../../util/db";
import { series, chapters } from "../../../util/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

interface ViewCountRequest {
  series: string;
  chapter: string;
}

export async function POST(request: Request) {
  try {
    const params = await request.json() as ViewCountRequest;
    
    if (!params.series || !params.chapter) {
      return NextResponse.json(
        { error: "Series and chapter are required" },
        { status: 400 }
      );
    }

    const seriesTitle = params.series;
    const chapterNumber = params.chapter.replace(/^chapter-/i, '');

    const sanitizeTitle = (title: string): string => {
      return title
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    };

    const sanitizedSeriesTitle = sanitizeTitle(seriesTitle);

    // Start a transaction to ensure both updates succeed or fail together
    const result = await db.transaction(async (tx) => {
      // Update series views
      const seriesUpdate = await tx
        .update(series)
        .set({
          total_views: sql`${series.total_views} + 1`,
          today_views: sql`${series.today_views} + 1`,
          updated_at: new Date(),
        })
        .where(eq(series.url, sanitizedSeriesTitle))
        .returning({ 
          total_views: series.total_views,
          today_views: series.today_views 
        });

      if (!seriesUpdate.length) {
        throw new Error(`Series not found: ${sanitizedSeriesTitle}`);
      }

      // Update chapter views
      const chapterUpdate = await tx
        .update(chapters)
        .set({
          views: sql`${chapters.views} + 1`,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(chapters.title, seriesTitle),
            sql`CAST(${chapters.chapter_number} AS decimal) = CAST(${chapterNumber} AS decimal)`
          )
        )
        .returning({ views: chapters.views });

      if (!chapterUpdate.length) {
        throw new Error(`Chapter not found: ${chapterNumber}`);
      }

      return {
        series: seriesUpdate[0],
        chapter: chapterUpdate[0],
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        series_total_views: result.series.total_views,
        series_today_views: result.series.today_views,
        chapter_views: result.chapter.views,
      }
    });

  } catch (error) {
    console.error("Error updating view counts:", error);
    
    // Handle specific error cases
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to update view counts",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Optional: Add rate limiting middleware
export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};