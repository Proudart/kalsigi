import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations } from '../../../../../util/schema';
import {  hasPermission } from '../../../../../util/scanlationUtils';
import { auth } from '@/lib/auth';
import { eq, count } from 'drizzle-orm';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get group details
    const group = await db
      .select()
      .from(scanlationGroups)
      .where(eq(scanlationGroups.id, params.id))
      .limit(1);

    if (group.length === 0) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Get member count and details
    const memberCountResult = await db
      .select({ count: count(groupMembers.id) })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, params.id));

    const members = await db
      .select({
        id: groupMembers.id,
        userId: groupMembers.userId,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
        status: groupMembers.status,
      })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, params.id));

    // Get creator info (update with your users table)
    let creator = null;
    try {
      creator = {
        id: group[0].createdBy,
        name: 'Unknown User',
        email: 'unknown@example.com'
      };
    } catch (error) {
      console.error('Error fetching creator info:', error);
    }

    return NextResponse.json({
      ...group[0],
      memberCount: memberCountResult[0]?.count || 0,
      members,
      creator,
    });
  } catch (error) {
    console.error('Error fetching group details:', error);
     return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}

// DELETE endpoint for permanently removing a group (use with caution)
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get confirmation from request body
    const body = await request.json();
    if (body.confirm !== 'DELETE') {
      return NextResponse.json({ 
        error: 'Deletion not confirmed. Send { "confirm": "DELETE" } in request body.' 
      }, { status: 400 });
    }

    // Delete the group (this will cascade delete members and invitations)
    const deletedGroup = await db
      .delete(scanlationGroups)
      .where(eq(scanlationGroups.id, params.id))
      .returning();

    if (deletedGroup.length === 0) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }


    return NextResponse.json({ 
      message: 'Group permanently deleted',
      deletedGroup: deletedGroup[0]
    });
  } catch (error) {
    console.error('Error deleting group:', error);
     return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}