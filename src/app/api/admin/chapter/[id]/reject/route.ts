// src/app/api/admin/chapters/[id]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from '../../../../../../util/db';
import { chapterSubmissions } from '../../../../../../util/schema';
import { eq } from "drizzle-orm";
import { deleteFromR2 } from '@/lib/r2';

export async function POST(request: NextRequest, props: { params: Promise<any> }) {
  const params = await props.params;
  try {
    const submissionId = params.id;
    const body = await request.json();
    const { rejectionReason } = body;

    // Get the submission
    const [submission] = await db
      .select()
      .from(chapterSubmissions)
      .where(eq(chapterSubmissions.id, submissionId))
      .limit(1);

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.status !== 'pending') {
      return NextResponse.json({ error: "Submission is not pending" }, { status: 400 });
    }

    // Delete all files from R2
    if (submission.pages_path) {
      try {
        // Delete all pages
        for (let i = 1; i <= submission.page_count; i++) {
          const pageNumber = i.toString().padStart(3, '0');
          const pageKey = `${submission.pages_path}/${pageNumber}.webp`;
          await deleteFromR2(pageKey);
        }

        // Delete start image if exists
        if (submission.start_image_url) {
          await deleteFromR2(`${submission.pages_path}/start.webp`);
        }

        // Delete end image if exists
        if (submission.end_image_url) {
          await deleteFromR2(`${submission.pages_path}/end.webp`);
        }
      } catch (error) {
        console.error('Error deleting chapter files:', error);
        // Continue with rejection even if file deletion fails
      }
    }

    // Update submission status
    await db
      .update(chapterSubmissions)
      .set({
        status: 'rejected',
        review_notes: rejectionReason,
        updated_at: new Date(),
      })
      .where(eq(chapterSubmissions.id, submissionId));

    return NextResponse.json({
      success: true,
      message: "Chapter rejected and files deleted",
    });
  } catch (error) {
    console.error("Error rejecting chapter:", error);
    return NextResponse.json({ error: "Failed to reject chapter" }, { status: 500 });
  }
}