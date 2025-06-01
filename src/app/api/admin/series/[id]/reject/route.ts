import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations, seriesSubmissions } from '../../../../../../util/schema';
import {  hasPermission } from '../../../../../../util/scanlationUtils';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';



export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const submissionId = params.id;
    const { reason, adminId } = await request.json();

    if (!reason || !adminId) {
      return NextResponse.json(
        { error: "Rejection reason and admin ID are required" },
        { status: 400 }
      );
    }

    // Check if submission exists and is pending
    const [submission] = await db
      .select({ submission_status: seriesSubmissions.submission_status })
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

    // Update submission to rejected
    await db
      .update(seriesSubmissions)
      .set({
        submission_status: 'rejected',
        rejection_reason: reason,
        updated_at: new Date(),
      })
      .where(eq(seriesSubmissions.id, submissionId));

    return NextResponse.json({
      success: true,
      message: "Submission rejected",
    });

  } catch (error) {
    console.error("Error rejecting submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
