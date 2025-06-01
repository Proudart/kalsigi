import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations} from '../../../../../../util/schema';
import { auth } from '@/lib/auth';
import { eq, and, or } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ token: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find and validate invitation
    const invitation = await db
      .select({
        id: groupInvitations.id,
        email: groupInvitations.email,
        userId: groupInvitations.userId,
        status: groupInvitations.status,
        group: {
          name: scanlationGroups.name,
          slug: scanlationGroups.slug,
        }
      })
      .from(groupInvitations)
      .innerJoin(scanlationGroups, eq(groupInvitations.groupId, scanlationGroups.id))
      .where(eq(groupInvitations.token, params.token))
      .limit(1);

    if (invitation.length === 0) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const invite = invitation[0];

    // Check if invitation is for current user
    const isForCurrentUser = invite.email === session.user.email || invite.userId === session.user.id;
    if (!isForCurrentUser) {
      return NextResponse.json({ error: 'This invitation is not for you' }, { status: 403 });
    }

    if (invite.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Invitation has already been processed',
        status: invite.status 
      }, { status: 400 });
    }

    // Mark invitation as declined
    await db
      .update(groupInvitations)
      .set({ status: 'declined' })
      .where(eq(groupInvitations.id, invite.id));

    return NextResponse.json({ 
      message: 'Invitation declined',
      group: invite.group
    });
  } catch (error) {
    console.error('Error declining invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
