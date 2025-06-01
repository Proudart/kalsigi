import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../..//util/db';
import { scanlationGroups, groupMembers, groupInvitations} from '../../../../../../util/schema';
import { auth } from '@/lib/auth';
import { eq, and, gt } from 'drizzle-orm';

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

    // Find the invitation
    const invitation = await db
      .select({
        id: groupInvitations.id,
        groupId: groupInvitations.groupId,
        email: groupInvitations.email,
        userId: groupInvitations.userId,
        role: groupInvitations.role,
        status: groupInvitations.status,
        expiresAt: groupInvitations.expiresAt,
        invitedBy: groupInvitations.invitedBy,
        group: {
          name: scanlationGroups.name,
          slug: scanlationGroups.slug,
          status: scanlationGroups.status,
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

    // Validate invitation
    if (invite.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Invitation has already been processed',
        status: invite.status 
      }, { status: 400 });
    }

    if (invite.expiresAt && new Date() > new Date(invite.expiresAt)) {
      // Mark as expired
      await db
        .update(groupInvitations)
        .set({ status: 'expired' })
        .where(eq(groupInvitations.id, invite.id));

      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // Check if invitation is for current user
    const isForCurrentUser = invite.email === session.user.email || invite.userId === session.user.id;
    if (!isForCurrentUser) {
      return NextResponse.json({ error: 'This invitation is not for you' }, { status: 403 });
    }

    // Check if user is already a member
    const existingMembership = await db
      .select({ id: groupMembers.id })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, invite.groupId),
          eq(groupMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingMembership.length > 0) {
      // Mark invitation as accepted but don't add duplicate membership
      await db
        .update(groupInvitations)
        .set({ status: 'accepted' })
        .where(eq(groupInvitations.id, invite.id));

      return NextResponse.json({ 
        message: 'You are already a member of this group',
        group: invite.group
      });
    }

    // Add user to group
    await db.insert(groupMembers).values({
      groupId: invite.groupId,
      userId: session.user.id,
      role: invite.role,
      invitedBy: invite.invitedBy,
      status: 'active',
    });

    // Mark invitation as accepted
    await db
      .update(groupInvitations)
      .set({ status: 'accepted' })
      .where(eq(groupInvitations.id, invite.id));

    return NextResponse.json({ 
      message: 'Successfully joined the group!',
      group: invite.group,
      role: invite.role
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
