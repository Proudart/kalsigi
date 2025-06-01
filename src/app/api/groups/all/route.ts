import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations, chapters, user } from '../../../../util/schema';
import { generateSlug, GroupStatus, GroupRole } from '../../../../util/scanlationUtils';
import { auth } from '@/lib/auth'; // Your existing auth
import { z } from 'zod';
import { eq, and, desc, sql, count, countDistinct, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Fetch groups with member count and chapters published count
    const groupsData = await db
      .select({
        id: scanlationGroups.id,
        name: scanlationGroups.name,
        slug: scanlationGroups.slug,
        url: scanlationGroups.websiteUrl,
        owner: user.name,
        createdAt: scanlationGroups.createdAt,
        avatarUrl: scanlationGroups.logoUrl,
        memberCount: countDistinct(groupMembers.userId).as('member_count'),
        chaptersPublished: count(chapters.id).as('chapters_published'),
      })
      .from(scanlationGroups)
      .leftJoin(groupMembers, eq(scanlationGroups.id, groupMembers.groupId))
      .leftJoin(chapters, eq(scanlationGroups.name, chapters.publisher))
      .leftJoin(user, eq(scanlationGroups.createdBy, user.id))
      .groupBy(scanlationGroups.id, scanlationGroups.name,scanlationGroups.slug, scanlationGroups.websiteUrl, user.name, scanlationGroups.createdAt, scanlationGroups.logoUrl)
      .orderBy(desc(sql`chapters_published`))
      .limit(50);

    const formattedGroups = groupsData.map(group => ({
      id: group.id,
      name: group.name,
      slug: group.slug,
      url: group.url,
      owner: group.owner,
      member_count: Number(group.memberCount) || 0,
      chapters_published: Number(group.chaptersPublished) || 0,
      created_at: group.createdAt.toISOString(),
      avatar_url: group.avatarUrl,
    }));


    return NextResponse.json(formattedGroups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}