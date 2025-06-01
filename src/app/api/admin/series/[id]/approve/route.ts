import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations, seriesSubmissions, series } from '../../../../../../util/schema';
import {  hasPermission } from '../../../../../../util/scanlationUtils';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const submissionId = params.id;
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get the submission
    const [submission] = await db
      .select()
      .from(seriesSubmissions)
      .where(eq(seriesSubmissions.id, submissionId))
      .limit(1);

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    if (submission.submission_status !== 'pending') {
      return NextResponse.json(
        { error: "Submission has already been processed" },
        { status: 400 }
      );
    }

    // Create the actual series record
    const [newSeries] = await db
      .insert(series)
      .values({
      url: submission.title.toLowerCase().replace(/[^a-z0-9\s\-*]/g, '').replace(/\s+/g, '-').replace(/\*+/g, '-').replace(/-+/g, '-').trim(),
      title: submission.title,
      alternative_titles: submission.alternative_titles ? [submission.alternative_titles] : null,
      description: submission.description,
      status: submission.status,
      type: submission.type ? [submission.type] : null,
      genre: submission.genres ? submission.genres.split(',').map(g => g.trim()) : null,
      author: submission.author,
      artist: submission.artist,
      release_date: submission.release_year ? new Date(`${submission.release_year}-01-01`) : null,
      cover_image_url: submission.cover_image_url,
      publisher: [], // Will be populated when chapters are added
      submitted_by: submission.group_id,
      url_code: Math.floor(100000 + Math.random() * 900000).toString()
      })
      .returning({ id: series.id, title: series.title });

    // Update submission status
    await db
      .update(seriesSubmissions)
      .set({
        submission_status: 'approved',
        approved_by: session.user.id,
        approved_series_id: newSeries.id,
        updated_at: new Date(),
      })
      .where(eq(seriesSubmissions.id, submissionId));

    return NextResponse.json({
      success: true,
      message: "Submission approved and series created",
      series: newSeries,
    });

  } catch (error) {
    console.error("Error approving submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}