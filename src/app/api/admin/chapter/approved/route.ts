import { NextRequest, NextResponse } from "next/server";
import { db } from '../../../../../util/db';
import { chapterSubmissions, series, scanlationGroups } from '../../../../../util/schema';
import { eq, desc, sql, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const groupId = searchParams.get('groupId');
    const seriesId = searchParams.get('seriesId');
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [eq(chapterSubmissions.status, 'approved')];
    
    if (groupId) {
      whereConditions.push(sql`${chapterSubmissions.group_id} = ${groupId}::uuid`);
    }
    if (seriesId) {
      whereConditions.push(eq(chapterSubmissions.series_id, seriesId));
    }

    let query = db
      .select({
        id: chapterSubmissions.id,
        series_id: chapterSubmissions.series_id,
        series_title: series.title,
        series_slug: series.url,
        chapter_number: chapterSubmissions.chapter_number,
        chapter_title: chapterSubmissions.chapter_title,
        release_notes: chapterSubmissions.release_notes,
        page_count: chapterSubmissions.page_count,
        approved_at: chapterSubmissions.updated_at,
        review_notes: chapterSubmissions.review_notes,
        group_name: scanlationGroups.name,
        group_slug: scanlationGroups.slug,
        approved_chapter_id: chapterSubmissions.approved_chapter_id,
      })
      .from(chapterSubmissions)
      .innerJoin(series, eq(chapterSubmissions.series_id, series.id))
      .innerJoin(scanlationGroups, sql`${chapterSubmissions.group_id} = ${scanlationGroups.id}::uuid`)
      .where(and(...whereConditions));

    const approvedSubmissions = await query
      .orderBy(desc(chapterSubmissions.updated_at))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(chapterSubmissions)
      .where(and(...whereConditions));

    const totalCount = await countQuery;

    return NextResponse.json({
      success: true,
      submissions: approvedSubmissions,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching approved submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch approved submissions" },
      { status: 500 }
    );
  }
}
