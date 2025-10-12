import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations, user, seriesSubmissions } from '../../../../../util/schema';
import {  hasPermission } from '../../../../../util/scanlationUtils';
import { auth } from '@/lib/auth';
import { and, count, desc, eq, like } from 'drizzle-orm';
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
    
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(seriesSubmissions.submission_status, 'pending')];
    if (search) {
      conditions.push(like(seriesSubmissions.title, `%${search}%`));
    }

    const whereClause = and(...conditions);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(seriesSubmissions)
      .where(whereClause);

    // Get pending submissions
    const pendingSubmissions = await db
      .select({
        id: seriesSubmissions.id,
        title: seriesSubmissions.title,
        alternative_titles: seriesSubmissions.alternative_titles,
        description: seriesSubmissions.description,
        status: seriesSubmissions.status,
        type: seriesSubmissions.type,
        genres: seriesSubmissions.genres,
        author: seriesSubmissions.author,
        artist: seriesSubmissions.artist,
        release_year: seriesSubmissions.release_year,
        source_url: seriesSubmissions.source_url,
        cover_image_url: seriesSubmissions.cover_image_url,
        created_at: seriesSubmissions.created_at,
        groupName: scanlationGroups.name,
        groupSlug: scanlationGroups.slug,
      })
      .from(seriesSubmissions)
      .leftJoin(scanlationGroups, eq(seriesSubmissions.group_id, scanlationGroups.id))
      .where(whereClause)
      .orderBy(desc(seriesSubmissions.created_at))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      submissions: pendingSubmissions,
      pagination: {
        total: totalResult.count,
        page,
        limit,
        totalPages: Math.ceil(totalResult.count / limit),
      },
    });

  } catch (error) {
    console.error("Error fetching pending submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
