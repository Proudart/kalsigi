import { NextRequest, NextResponse } from "next/server";
import { db } from '../../../../../util/db';
import { chapters, series, scanlationGroups, chapterSubmissions } from '../../../../../util/schema';
import { eq, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chapterId = params.id;

    // Fetch chapter with series and group information
    const chapter = await db
      .select({
        id: chapters.id,
        series_id: chapters.series_id,
        series_title: series.title,
        series_slug: series.url,
        chapter_number: chapters.chapter_number,
        title: chapters.title,
        release_notes: chapterSubmissions.release_notes,
        page_count: chapterSubmissions.page_count,
        start_image_url: chapterSubmissions.start_image_url,
        end_image_url: chapterSubmissions.end_image_url,
        created_at: chapters.created_at,
        updated_at: chapters.updated_at,
        group_name: scanlationGroups.name,
        group_slug: scanlationGroups.slug,
      })
      .from(chapters)
      .innerJoin(chapterSubmissions, eq(chapterSubmissions.series_id, series.id))
      .innerJoin(scanlationGroups, sql`${chapters.publisher} = ${scanlationGroups.name}::uuid`)
      .where(eq(chapters.id, chapterId))
      .limit(1);

    if (chapter.length === 0) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      chapter: chapter[0]
    });
  } catch (error) {
    console.error("Error fetching chapter:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapter" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chapterId = params.id;
    const body = await request.json();
    const { title, release_notes } = body;

    const updatedChapter = await db
      .update(chapters)
      .set({
        title,
        updated_at: new Date(),
      })
      .where(eq(chapters.id, chapterId))
      .returning();

    if (updatedChapter.length === 0) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      chapter: updatedChapter[0]
    });
  } catch (error) {
    console.error("Error updating chapter:", error);
    return NextResponse.json(
      { error: "Failed to update chapter" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chapterId = params.id;

    const deletedChapter = await db
      .delete(chapters)
      .where(eq(chapters.id, chapterId))
      .returning();

    if (deletedChapter.length === 0) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Chapter deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return NextResponse.json(
      { error: "Failed to delete chapter" },
      { status: 500 }
    );
  }
}
