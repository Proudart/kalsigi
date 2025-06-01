import { NextRequest, NextResponse } from "next/server";
import { db } from '../../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations, seriesSubmissions, series } from '../../../../../util/schema';
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {

    const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

    const { searchParams } = new URL(request.url);
    const groupName = searchParams.get("groupId");

    if (!groupName) {
      return NextResponse.json(
        { error: "Group Name is required" },
        { status: 400 }
      );
    }




    // Fetch submissions from database with group information
    // First, get the group ID from the group name
    const group = await db
      .select({ id: scanlationGroups.id })
      .from(scanlationGroups)
      .where(eq(scanlationGroups.name, groupName))
      .limit(1);

    if (!group.length) {
      return NextResponse.json(
      { error: "Group not found" },
      { status: 404 }
      );
    }

    const groupId = group[0].id;

    // Fetch submissions from database with group information
    const submissions = await db
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
      submission_status: seriesSubmissions.submission_status,
      rejection_reason: seriesSubmissions.rejection_reason,
      approved_by: seriesSubmissions.approved_by,
      approved_series_id: seriesSubmissions.approved_series_id,
      created_at: seriesSubmissions.created_at,
      updated_at: seriesSubmissions.updated_at,
      groupName: scanlationGroups.name,
      })
      .from(seriesSubmissions)
      .leftJoin(scanlationGroups, eq(seriesSubmissions.group_id, scanlationGroups.id))
      .where(eq(seriesSubmissions.group_id, groupId))
      .orderBy(desc(seriesSubmissions.created_at));

    // Transform data to match expected format
    const formattedSubmissions = submissions.map((submission) => ({
      id: submission.id,
      title: submission.title,
      description: submission.description,
      status: submission.submission_status,
      type: submission.type,
      genres: submission.genres ? submission.genres.split(',').map(g => g.trim()) : [],
      author: submission.author,
      artist: submission.artist,
      coverImageUrl: submission.cover_image_url,
      sourceUrl: submission.source_url,
      submittedAt: submission.created_at?.toISOString(),
      reviewedAt: submission.updated_at?.toISOString(),
      reviewNotes: submission.rejection_reason || (submission.approved_by ? "Series approved and added to platform" : null),
      groupName: submission.groupName,
      alternativeTitles: submission.alternative_titles,
      releaseYear: submission.release_year,
      approvedSeriesId: submission.approved_series_id,
    }));

    return NextResponse.json(formattedSubmissions);

  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}