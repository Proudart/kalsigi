import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations } from '../../../../../util/schema';
import {  hasPermission } from '../../../../../util/scanlationUtils';
import { auth } from '@/lib/auth';
import { eq, count, sql } from 'drizzle-orm';
import type { Session } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers }) as Session | null;


    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get group statistics
    const [
      totalGroupsResult,
      pendingGroupsResult,
      approvedGroupsResult,
      rejectedGroupsResult,
      totalMembersResult
    ] = await Promise.all([
      // Total groups
      db.select({ count: count(scanlationGroups.id) }).from(scanlationGroups),
      
      // Pending groups
      db.select({ count: count(scanlationGroups.id) })
        .from(scanlationGroups)
        .where(eq(scanlationGroups.status, 'pending')),
      
      // Approved groups
      db.select({ count: count(scanlationGroups.id) })
        .from(scanlationGroups)
        .where(eq(scanlationGroups.status, 'approved')),
      
      // Rejected groups
      db.select({ count: count(scanlationGroups.id) })
        .from(scanlationGroups)
        .where(eq(scanlationGroups.status, 'rejected')),
      
      // Total members across all groups
      db.select({ count: count(groupMembers.id) }).from(groupMembers)
    ]);

    // Get groups created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentGroupsResult = await db
      .select({ count: count(scanlationGroups.id) })
      .from(scanlationGroups)
      .where(sql`${scanlationGroups.createdAt} >= ${thirtyDaysAgo}`);

    // Get average members per group
    const avgMembersResult = await db
      .select({
        avgMembers: sql<number>`ROUND(AVG(member_counts.member_count), 2)`.as('avgMembers')
      })
      .from(
        db
          .select({
            groupId: groupMembers.groupId,
            memberCount: count(groupMembers.id).as('member_count')
          })
          .from(groupMembers)
          .groupBy(groupMembers.groupId)
          .as('member_counts')
      );

    const stats = {
      totalGroups: totalGroupsResult[0]?.count || 0,
      pendingGroups: pendingGroupsResult[0]?.count || 0,
      approvedGroups: approvedGroupsResult[0]?.count || 0,
      rejectedGroups: rejectedGroupsResult[0]?.count || 0,
      totalMembers: totalMembersResult[0]?.count || 0,
      recentGroups: recentGroupsResult[0]?.count || 0,
      averageMembersPerGroup: avgMembersResult[0]?.avgMembers || 0,
      approvalRate: totalGroupsResult[0]?.count > 0 
        ? Math.round((approvedGroupsResult[0]?.count / totalGroupsResult[0]?.count) * 100)
        : 0
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching group stats:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : String(error)) 
        : undefined
    }, { status: 500 });
  }
}