import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../../util/db';
import { scanlationGroups, seriesSubmissions, series } from '../../../../../../util/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { generateR2Paths, moveFileInR2 } from '@/lib/r2';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const submissionId = params.id;
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get the submission with group info
    const submissionQuery = await db
      .select({
        submission: seriesSubmissions,
        group: scanlationGroups,
      })
      .from(seriesSubmissions)
      .innerJoin(scanlationGroups, eq(seriesSubmissions.group_id, scanlationGroups.id))
      .where(eq(seriesSubmissions.id, submissionId))
      .limit(1);

    if (submissionQuery.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const { submission, group } = submissionQuery[0];

    if (submission.submission_status !== 'pending') {
      return NextResponse.json({ error: "Submission has already been processed" }, { status: 400 });
    }

    // Generate clean URL from title
    const cleanUrl = submission.title
      .toLowerCase()
      .replace(/[^a-z0-9\s\-*]/g, '')
      .replace(/\s+/g, '-')
      .replace(/\*+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let finalCoverUrl = submission.cover_image_url;

    // Move cover image from pending to final location if it exists
    if (submission.cover_image_path && cleanUrl) {
      try {
        const paths = generateR2Paths('series', group.slug, cleanUrl);
        await moveFileInR2(submission.cover_image_path, paths.final);
        finalCoverUrl = `${process.env.R2_PUBLIC_URL}/${paths.final}`;
      } catch (error) {
        console.error('Error moving cover image:', error);
        // Continue with approval even if image move fails
      }
    }

    // Create the actual series record
    const [newSeries] = await db
      .insert(series)
      .values({
        url: cleanUrl,
        title: submission.title,
        alternative_titles: submission.alternative_titles ? [submission.alternative_titles] : null,
        description: submission.description,
        status: submission.status,
        type: submission.type ? [submission.type] : null,
        genre: submission.genres ? submission.genres.split(',').map(g => g.trim()) : null,
        author: submission.author,
        artist: submission.artist,
        release_date: submission.release_year ? new Date(`${submission.release_year}-01-01`) : null,
        cover_image_url: finalCoverUrl,
        publisher: [],
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
      message: "Series approved and published",
      series: newSeries,
    });

  } catch (error) {
    console.error("Error approving series:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}