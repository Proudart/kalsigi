import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations, seriesSubmissions, series } from '../../../../../util/schema';
import { eq, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import type { Session } from '@/types';


export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {

    const session = await auth.api.getSession({ headers: request.headers }) as Session | null;

        if (!session || session.user.role !== 'admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
    const seriesId = params.id;

    const [seriesData] = await db
      .select({
        id: series.id,
        title: series.title,
        url: series.url,
        alternative_titles: series.alternative_titles,
        description: series.description,
        total_chapters: series.total_chapters,
        cover_image_url: series.cover_image_url,
        author: series.author,
        artist: series.artist,
        genre: series.genre,
        type: series.type,
        release_date: series.release_date,
        status: series.status,
        publisher: series.publisher,
        submitted_by: series.submitted_by,
        total_views: series.total_views,
        today_views: series.today_views,
        created_at: series.created_at,
        updated_at: series.updated_at,
        groupName: scanlationGroups.name,
        groupSlug: scanlationGroups.slug,
      })
      .from(series)
      .leftJoin(scanlationGroups, eq(series.submitted_by, scanlationGroups.id))
      .where(eq(series.id, seriesId))
      .limit(1);

    if (!seriesData) {
      return NextResponse.json(
        { error: "Series not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(seriesData);

  } catch (error) {
    console.error("Error fetching series:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {

    const session = await auth.api.getSession({ headers: request.headers }) as Session | null;

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const seriesId = params.id;
    const updates = await request.json();

    // Validate that series exists
    const [existingSeries] = await db
      .select({ id: series.id })
      .from(series)
      .where(eq(series.id, seriesId))
      .limit(1);

    if (!existingSeries) {
      return NextResponse.json(
        { error: "Series not found" },
        { status: 404 }
      );
    }

    // Update series
    await db
      .update(series)
      .set({
        ...updates,
        updated_at: new Date(),
      })
      .where(eq(series.id, seriesId));

    return NextResponse.json({
      success: true,
      message: "Series updated successfully",
    });

  } catch (error) {
    console.error("Error updating series:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {

    const session = await auth.api.getSession({ headers: request.headers }) as Session | null;

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const seriesId = params.id;

    // Delete series (cascade will handle related records)
    const result = await db
      .delete(series)
      .where(eq(series.id, seriesId))
      .returning({ id: series.id });

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Series not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Series deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting series:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}