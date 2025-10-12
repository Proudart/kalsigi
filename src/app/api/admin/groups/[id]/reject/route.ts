import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations } from '../../../../../../util/schema';
import {  hasPermission } from '../../../../../../util/scanlationUtils';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { Session } from '@/types';

const RejectSchema = z.object({
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters').optional(),
});

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({ headers: request.headers }) as Session | null;

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Parse request body for rejection reason
    let rejectionReason = '';
    try {
      const body = await request.json();
      const { reason } = RejectSchema.parse(body);
      rejectionReason = reason || 'No reason provided';
    } catch (parseError) {
      // If body parsing fails, continue with empty reason
      rejectionReason = 'No reason provided';
    }

    // Get the group first to validate it exists and is pending
    const existingGroup = await db
      .select()
      .from(scanlationGroups)
      .where(eq(scanlationGroups.id, params.id))
      .limit(1);

    if (existingGroup.length === 0) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (existingGroup[0].status !== 'pending') {
      return NextResponse.json({ 
        error: 'Group is not pending approval',
        currentStatus: existingGroup[0].status 
      }, { status: 400 });
    }

    // Reject the group (set status to rejected instead of deleting)
    const [updatedGroup] = await db
      .update(scanlationGroups)
      .set({
        status: 'rejected',
        updatedAt: new Date(),
        // You might want to add a rejection_reason field to store the reason
      })
      .where(eq(scanlationGroups.id, params.id))
      .returning();

    // TODO: Send notification email to group owner with rejection reason
    // TODO: Log admin action in audit table

    return NextResponse.json({ 
      message: 'Group rejected successfully', 
      group: {
        id: updatedGroup.id,
        name: updatedGroup.name,
        status: updatedGroup.status,
        updatedAt: updatedGroup.updatedAt
      },
      rejectionReason
    });
  } catch (error) {
    console.error('Error rejecting group:', error);
     return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}