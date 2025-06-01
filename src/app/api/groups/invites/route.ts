import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations} from '../../../../util/schema';
import { auth } from '@/lib/auth';
import { eq, and, or, gt } from 'drizzle-orm';

// GET /api/groups/invites - Get all pending invitations for current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get invitations by email or user ID that are still pending and not expired
    const invitations = await db
      .select({
        id: groupInvitations.id,
        email: groupInvitations.email,
        role: groupInvitations.role,
        status: groupInvitations.status,
        expiresAt: groupInvitations.expiresAt,
        createdAt: groupInvitations.createdAt,
        token: groupInvitations.token,
        group: {
          id: scanlationGroups.id,
          name: scanlationGroups.name,
          slug: scanlationGroups.slug,
          description: scanlationGroups.description,
          logoUrl: scanlationGroups.logoUrl,
          status: scanlationGroups.status,
        }
      })
      .from(groupInvitations)
      .innerJoin(scanlationGroups, eq(groupInvitations.groupId, scanlationGroups.id))
      .where(
        and(
          or(
            eq(groupInvitations.email, session.user.email),
            eq(groupInvitations.userId, session.user.id)
          ),
          eq(groupInvitations.status, 'pending'),
          gt(groupInvitations.expiresAt, new Date())
        )
      )
      .orderBy(groupInvitations.createdAt);

    return NextResponse.json(invitations);
  } catch (error) {
    console.error('Error fetching user invitations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
