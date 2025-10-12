import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations } from '../../../../../../util/schema';
import {  hasPermission } from '../../../../../../util/scanlationUtils';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import type { Session } from '@/types';

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({ headers: request.headers }) as Session | null;

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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

    // Approve the group
    const [updatedGroup] = await db
      .update(scanlationGroups)
      .set({
        status: 'approved',
        updatedAt: new Date(),
      })
      .where(eq(scanlationGroups.id, params.id))
      .returning();

    // TODO: Send notification email to group owner
    // TODO: Log admin action in audit table

    return NextResponse.json({ 
      message: 'Group approved successfully', 
      group: {
        id: updatedGroup.id,
        name: updatedGroup.name,
        status: updatedGroup.status,
        updatedAt: updatedGroup.updatedAt
      }
    });
  } catch (error) {
    console.error('Error approving group:', error);
     return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}
