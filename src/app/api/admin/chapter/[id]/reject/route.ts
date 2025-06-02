import { NextRequest, NextResponse } from "next/server";
import { db } from '../../../../../../util/db';
import { chapterSubmissions } from '../../../../../../util/schema';
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const submissionId = params.id;
    const body = await request.json();
    const { reviewNotes } = body;

    // Check if submission exists and is pending
    const submission = await db
      .select()
      .from(chapterSubmissions)
      .where(eq(chapterSubmissions.id, submissionId))
      .limit(1);

    if (submission.length === 0) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    if (submission[0].status !== 'pending') {
      return NextResponse.json(
        { error: "Submission is not pending" },
        { status: 400 }
      );
    }

    // Update submission status to rejected
    await db
      .update(chapterSubmissions)
      .set({
        status: 'rejected',
        review_notes: reviewNotes,
        updated_at: new Date(),
      })
      .where(eq(chapterSubmissions.id, submissionId));

    return NextResponse.json({
      success: true,
      message: "Chapter submission rejected"
    });
  } catch (error) {
    console.error("Error rejecting chapter:", error);
    return NextResponse.json(
      { error: "Failed to reject chapter" },
      { status: 500 }
    );
  }
}