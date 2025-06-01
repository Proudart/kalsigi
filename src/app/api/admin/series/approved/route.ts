import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations, series } from '../../../../../util/schema';
import {  hasPermission } from '../../../../../util/scanlationUtils';
import { auth } from '@/lib/auth';
import { and, count, desc, eq, isNotNull, like } from 'drizzle-orm';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }


    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    
    const offset = (page - 1) * limit;

    // Build where conditions - only show series that were submitted by groups
    const conditions = [isNotNull(series.submitted_by)];
    if (search) {
      conditions.push(like(series.title, `%${search}%`));
    }

    const whereClause = and(...conditions);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(series)
      .where(whereClause);

    // Get approved series
    const approvedSeries = await db
      .select({
        id: series.id,
        title: series.title,
        description: series.description,
        cover_image_url: series.cover_image_url,
        author: series.author,
        artist: series.artist,
        status: series.status,
        total_chapters: series.total_chapters,
        total_views: series.total_views,
        created_at: series.created_at,
        groupName: scanlationGroups.name,
        groupSlug: scanlationGroups.slug,
      })
      .from(series)
      .leftJoin(scanlationGroups, eq(series.submitted_by, scanlationGroups.id))
      .where(whereClause)
      .orderBy(desc(series.created_at))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      series: approvedSeries,
      pagination: {
        total: totalResult.count,
        page,
        limit,
        totalPages: Math.ceil(totalResult.count / limit),
      },
    });

  } catch (error) {
    console.error("Error fetching approved series:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}