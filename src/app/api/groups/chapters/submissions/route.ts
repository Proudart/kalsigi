import { NextRequest, NextResponse } from "next/server";
import { db } from '../../../../../util/db';
import { chapterSubmissions, series, scanlationGroups } from '../../../../../util/schema';
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

      const group = await db
      .select({ id: scanlationGroups.id })
      .from(scanlationGroups)
      .where(eq(scanlationGroups.name, groupId))
      .limit(1);


    if (!group.length) {
      return NextResponse.json(
      { error: "Group not found" },
      { status: 404 }
      );
    }

    // Fetch chapter submissions for the group with series information
    const submissions = await db
      .select({
        id: chapterSubmissions.id,
        series_id: chapterSubmissions.series_id,
        chapter_number: chapterSubmissions.chapter_number,
        series_title: series.title,
        series_url: series.url,
        series_url_code: series.url_code,
        release_notes: chapterSubmissions.release_notes,
        status: chapterSubmissions.status,
        page_count: chapterSubmissions.page_count,
        start_image_url: chapterSubmissions.start_image_url,
        end_image_url: chapterSubmissions.end_image_url,
        submitted_at: chapterSubmissions.created_at,
        reviewed_at: chapterSubmissions.updated_at,
        review_notes: chapterSubmissions.review_notes,
        group_name: scanlationGroups.name,
        approved_chapter_id: chapterSubmissions.approved_chapter_id,
      })
      .from(chapterSubmissions)
      .innerJoin(scanlationGroups, eq(chapterSubmissions.group_id, group[0].id))
      .innerJoin(series, eq(chapterSubmissions.series_id, series.id))
      .where(sql`${chapterSubmissions.group_id} = ${group[0].id}::uuid`)
      .orderBy(desc(chapterSubmissions.created_at));

    return NextResponse.json({
      success: true,
      submissions: submissions,
    });

  } catch (error) {
    console.error("Error fetching chapter submissions:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch chapter submissions" },
      { status: 500 }
    );
  }
}