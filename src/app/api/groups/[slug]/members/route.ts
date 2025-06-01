import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations, user} from '../../../../../util/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

// GET /api/groups/[slug]/members - Get group members
export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is member of the group
    const userMembership = await db
      .select({ role: groupMembers.role })
      .from(groupMembers)
      .innerJoin(scanlationGroups, eq(groupMembers.groupId, scanlationGroups.id))
      .where(
        and(
          eq(scanlationGroups.slug, params.slug),
          eq(groupMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (userMembership.length === 0) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    // Get all group members (you'll need to join with users table for user info)
    const members = await db
      .select({
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
        status: groupMembers.status,
        name: user.name,  
      })
      .from(groupMembers)
      .innerJoin(scanlationGroups, eq(groupMembers.groupId, scanlationGroups.id))
      .innerJoin(user, eq(groupMembers.userId, user.id)) // Assuming you have a users table
      .where(eq(scanlationGroups.slug, params.slug));
    

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching group members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
