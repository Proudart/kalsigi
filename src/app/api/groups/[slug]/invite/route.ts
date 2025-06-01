import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations } from '../../../../../util/schema';
import {  hasPermission } from '../../../../../util/scanlationUtils';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { randomBytes } from 'crypto';

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['member', 'uploader', 'qa', 'moderator', 'co-owner']),
});

// POST /api/groups/[slug]/invite - Invite user to group
export async function POST(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, role } = InviteSchema.parse(body);

    // Check if user has permission to invite
    const membership = await db
      .select({ role: groupMembers.role, groupId: scanlationGroups.id })
      .from(groupMembers)
      .innerJoin(scanlationGroups, eq(groupMembers.groupId, scanlationGroups.id))
      .where(
        and(
          eq(scanlationGroups.slug, params.slug),
          eq(groupMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (membership.length === 0 || !hasPermission(membership[0].role as any, 'invite_users')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Generate invitation token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation
    const [invitation] = await db
      .insert(groupInvitations)
      .values({
        groupId: membership[0].groupId,
        invitedBy: session.user.id,
        email,
        role,
        token,
        expiresAt,
      })
      .returning();

    // TODO: Send invitation email

    return NextResponse.json({ message: 'Invitation sent', invitationId: invitation.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Error sending invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
