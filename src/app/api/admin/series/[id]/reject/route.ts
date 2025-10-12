import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../../util/db';
import { seriesSubmissions } from '../../../../../../util/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { deleteFromR2 } from '@/lib/r2';
import type { Session } from '@/types';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const submissionId = params.id;
    const session = await auth.api.getSession({ headers: request.headers }) as Session | null;

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { rejectionReason } = body;

    // Get the submission
    const [submission] = await db
      .select()
      .from(seriesSubmissions)
      .where(eq(seriesSubmissions.id, submissionId))
      .limit(1);

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.submission_status !== 'pending') {
      return NextResponse.json({ error: "Submission has already been processed" }, { status: 400 });
    }

    // Delete cover image from R2 if exists
    if (submission.cover_image_path) {
      try {
        await deleteFromR2(submission.cover_image_path);
      } catch (error) {
        console.error('Error deleting cover image:', error);
        // Continue with rejection even if file deletion fails
      }
    }

    // Update submission status
    await db
      .update(seriesSubmissions)
      .set({
        submission_status: 'rejected',
        rejection_reason: rejectionReason,
        approved_by: session.user.id,
        updated_at: new Date(),
      })
      .where(eq(seriesSubmissions.id, submissionId));

    return NextResponse.json({
      success: true,
      message: "Series rejected and files deleted",
    });

  } catch (error) {
    console.error("Error rejecting series:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}