import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations } from '../../../../../util/schema';
import {  hasPermission } from '../../../../../util/scanlationUtils';
import { auth } from '@/lib/auth';
import { eq, count, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    // Check if user is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get URL parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get approved groups with pagination
    const approvedGroups = await db
      .select({
        id: scanlationGroups.id,
        name: scanlationGroups.name,
        slug: scanlationGroups.slug,
        description: scanlationGroups.description,
        websiteUrl: scanlationGroups.websiteUrl,
        discordUrl: scanlationGroups.discordUrl,
        logoUrl: scanlationGroups.logoUrl,
        status: scanlationGroups.status,
        createdAt: scanlationGroups.createdAt,
        updatedAt: scanlationGroups.updatedAt,
        createdBy: scanlationGroups.createdBy,
      })
      .from(scanlationGroups)
      .where(eq(scanlationGroups.status, 'approved'))
      .orderBy(desc(scanlationGroups.updatedAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: count(scanlationGroups.id) })
      .from(scanlationGroups)
      .where(eq(scanlationGroups.status, 'approved'));

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get details for each group
    const groupsWithDetails = await Promise.all(
      approvedGroups.map(async (group) => {
        // Get member count
        const memberCountResult = await db
          .select({ count: count(groupMembers.id) })
          .from(groupMembers)
          .where(eq(groupMembers.groupId, group.id));

        const memberCount = memberCountResult[0]?.count || 0;

        // Get active member count
        const activeMemberCountResult = await db
          .select({ count: count(groupMembers.id) })
          .from(groupMembers)
          .where(and(
            eq(groupMembers.groupId, group.id),
            eq(groupMembers.status, 'active')
          ));

        const activeMemberCount = activeMemberCountResult[0]?.count || 0;

        // Get creator information (update with your users table)
        let creator = null;
        try {
          // Replace with your actual users table query
          creator = {
            id: group.createdBy,
            name: 'Unknown User',
            email: 'unknown@example.com'
          };
        } catch (error) {
          console.error('Error fetching creator info:', error);
        }

        return {
          ...group,
          memberCount,
          activeMemberCount,
          creator,
        };
      })
    );

    return NextResponse.json({
      groups: groupsWithDetails,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    });
  } catch (error) {
    console.error('Error fetching approved groups:', error);
     return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}
