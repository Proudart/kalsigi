import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations } from '../../../util/schema';
import { generateSlug, GroupStatus, GroupRole } from '../../../util/scanlationUtils';
import { auth } from '@/lib/auth'; // Your existing auth
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';

const CreateGroupSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  websiteUrl: z.string().url().optional(),
  discordUrl: z.string().url().optional(),
});

// GET /api/groups - List user's groups
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userGroups = await db
      .select({
        group: scanlationGroups,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
      })
      .from(groupMembers)
      .innerJoin(scanlationGroups, eq(groupMembers.groupId, scanlationGroups.id))
      .where(eq(groupMembers.userId, session.user.id));

    return NextResponse.json(userGroups);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/groups - Create new group
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Update the schema validation for the request
    const CreateGroupSchemaWithNullableUrls = z.object({
      name: z.string().min(3).max(100),
      description: z.string().max(500).optional(),
      websiteUrl: z.union([z.string().url(), z.string().max(0), z.null()]).optional(),
      discordUrl: z.union([z.string().url(), z.string().max(0), z.null()]).optional(),
    });
    
    const validatedData = CreateGroupSchemaWithNullableUrls.parse(body);

    const slug = generateSlug(validatedData.name);
    
    // Check if slug already exists
    const existingGroup = await db
      .select({ id: scanlationGroups.id })
      .from(scanlationGroups)
      .where(eq(scanlationGroups.slug, slug))
      .limit(1);

    if (existingGroup.length > 0) {
      return NextResponse.json({ error: 'Group name already exists' }, { status: 400 });
    }

    // Create group
    const [newGroup] = await db
      .insert(scanlationGroups)
      .values({
        name: validatedData.name,
        slug,
        description: validatedData.description,
        websiteUrl: validatedData.websiteUrl || null,
        discordUrl: validatedData.discordUrl || null,
        createdBy: session.user.id,
        status: GroupStatus.PENDING,
      })
      .returning();

    // Add creator as owner
    await db.insert(groupMembers).values({
      groupId: newGroup.id,
      userId: session.user.id,
      role: GroupRole.OWNER,
    });

    return NextResponse.json(newGroup, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}