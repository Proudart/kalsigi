import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations, series, seriesSubmissions } from '../../../../util/schema';
import {  hasPermission } from '../../../../util/scanlationUtils';
import { auth } from '@/lib/auth';
import { eq, count, sql, gte, like, or, and, desc } from 'drizzle-orm';
import type { Session } from '@/types';

export async function GET(request: NextRequest) {
  try {

        const session = await auth.api.getSession({ headers: request.headers }) as Session | null;

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const submittedBy = searchParams.get("submittedBy");
    
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(series.title, `%${search}%`),
          like(series.author, `%${search}%`)
        )
      );
    }
    if (status) conditions.push(eq(series.status, status));
    if (submittedBy) conditions.push(eq(series.submitted_by, submittedBy));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(series)
      .where(whereClause);

    // Get series with group info
    const seriesData = await db
      .select({
        id: series.id,
        title: series.title,
        description: series.description,
        cover_image_url: series.cover_image_url,
        author: series.author,
        artist: series.artist,
        status: series.status,
        type: series.type,
        total_chapters: series.total_chapters,
        total_views: series.total_views,
        submitted_by: series.submitted_by,
        created_at: series.created_at,
        updated_at: series.updated_at,
        groupName: scanlationGroups.name,
      })
      .from(series)
      .leftJoin(scanlationGroups, eq(series.submitted_by, scanlationGroups.id))
      .where(whereClause)
      .orderBy(desc(series.created_at))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      series: seriesData,
      pagination: {
        total: totalResult.count,
        page,
        limit,
        totalPages: Math.ceil(totalResult.count / limit),
      },
    });

  } catch (error) {
    console.error("Error fetching admin series:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}