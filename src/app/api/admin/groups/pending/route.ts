import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations, user } from '../../../../../util/schema';
import {  hasPermission } from '../../../../../util/scanlationUtils';
import { auth } from '@/lib/auth';
import { eq, count } from 'drizzle-orm';
import type { Session } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers }) as Session | null;

    // Check if user is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get pending groups with creator information
    const pendingGroups = await db
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
      .where(eq(scanlationGroups.status, 'pending'))
      .orderBy(scanlationGroups.createdAt);

    // Get member count and creator info for each group
    const groupsWithDetails = await Promise.all(
      pendingGroups.map(async (group) => {

        // Get member count
        const memberCountResult = await db
          .select({ count: count(groupMembers.id) })
          .from(groupMembers)
          .where(eq(groupMembers.groupId, group.id));

        const memberCount = memberCountResult[0]?.count || 0;

        let creator = null;
        try {
           
            // Fetch creator info (update with your users table)
            const creatorResult = await db
                .select({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                })
                .from(user)
                .where(eq(user.id, group.createdBy))
                .limit(1)
                .then(res => res[0]);

            // If no creator found, use a default object for the creator
            creator = creatorResult || {
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
          creator,
        };
      })
    );

    return NextResponse.json(groupsWithDetails);
  } catch (error) {
    console.error('Error fetching pending groups:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}
