// src/app/api/groups/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations } from '../../../../util/schema';
import {  hasPermission } from '../../../../util/scanlationUtils';

import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// GET /api/groups/[slug] - Get group details
export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    const group = await db
      .select()
      .from(scanlationGroups)
      .where(eq(scanlationGroups.slug, params.slug))
      .limit(1);

    if (group.length === 0) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    let userRole = null;
    if (session) {
      const membership = await db
        .select({ role: groupMembers.role })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, group[0].id),
            eq(groupMembers.userId, session.user.id)
          )
        )
        .limit(1);

      userRole = membership[0]?.role || null;
    }

    return NextResponse.json({
      ...group[0],
      userRole,
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/groups/[slug] - Update group
export async function PUT(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to manage group
    const membership = await db
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

    if (membership.length === 0 || !hasPermission(membership[0].role as any, 'manage_group')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      description: z.string().optional(),
      website: z.string().url('Invalid URL').optional(),
      discord: z.string().optional(),
      twitter: z.string().optional(),
      logoUrl: z.string().url('Invalid URL').optional(),
    });

    const validatedData = schema.parse(body);

    const [updatedGroup] = await db
      .update(scanlationGroups)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(scanlationGroups.slug, params.slug))
      .returning();

    return NextResponse.json(updatedGroup);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error updating group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
