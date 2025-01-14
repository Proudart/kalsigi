import { NextRequest, NextResponse } from "next/server";
import { db } from "@/util/db";
import { userSeriesMessageInteractions, user, seriesMessages } from "@/util/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "../../../../lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
// GET /api/auth/seriesMessages
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get('seriesId');
  
    if (!seriesId) {
      return NextResponse.json({ error: "Missing seriesId" }, { status: 400 });
    }
  
    const messages = await db
      .select({
        id: seriesMessages.id,
        content: seriesMessages.content,
        createdAt: seriesMessages.createdAt,
        likes: seriesMessages.likes,
        dislikes: seriesMessages.dislikes,
        parentId: seriesMessages.parentId,
        username: user.name,
      })
      .from(seriesMessages)
      .leftJoin(user, eq(seriesMessages.userId, user.id))
      .where(eq(seriesMessages.seriesId, seriesId))
      .orderBy(seriesMessages.createdAt);
  
    return NextResponse.json(messages);
  }
  
  // POST /api/auth/seriesMessages
  export async function POST(request: NextRequest) {
    const user = await auth.api.getSession({
      headers: await headers(),
    });
  
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const { seriesId, content, parentId } = await request.json();
  
    if (!seriesId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
  
    const newMessage = await db.insert(seriesMessages).values({
      seriesId,
      userId: user.user.id,
      content,  
      parentId: parentId || null,
    }).returning() as any;
  
    return NextResponse.json(newMessage[0]);
  }
  
  // PUT /api/auth/seriesMessages
  export async function PUT(request: NextRequest) {
    try {
      const user = await auth.api.getSession({
        headers: await headers(),
      });
    
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    
      const { messageId, action } = await request.json();
    
      if (!messageId || !action || (action !== 'likes' && action !== 'dislikes')) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      }
    
      // Check if the user has already interacted with this message
      const existingInteraction = await db
        .select()
        .from(userSeriesMessageInteractions)
        .where(and(
          eq(userSeriesMessageInteractions.userId, user.user.id),
          eq(userSeriesMessageInteractions.messageId, messageId)
        ))
        .limit(1);
    
        if (existingInteraction.length > 0) {
            if (existingInteraction[0].interactionType === action) {
              // User is trying to perform the same action again, so we'll remove their interaction
              await db
                .delete(userSeriesMessageInteractions)
                .where(and(
                  eq(userSeriesMessageInteractions.userId, user.user.id),
                  eq(userSeriesMessageInteractions.messageId, messageId)
                ));
      
              await db
                .update(seriesMessages)
                .set({ 
                  [action]: sql`${seriesMessages[action]} - 1`
                })
                .where(eq(seriesMessages.id, messageId));
            } else {
              // User is changing their interaction from like to dislike or vice versa
              await db
                .update(userSeriesMessageInteractions)
                .set({ interactionType: action })
                .where(and(
                  eq(userSeriesMessageInteractions.userId, user.user.id),
                  eq(userSeriesMessageInteractions.messageId, messageId)
                ));
      
              await db
                .update(seriesMessages)
                .set({ 
                  [action]: sql`${seriesMessages[action]} + 1`,
                  [existingInteraction[0].interactionType]: sql`${seriesMessages[existingInteraction[0].interactionType]} - 1`
                })
                .where(eq(seriesMessages.id, messageId));
            }
          } else {
            // New interaction
    
            await db
              .insert(userSeriesMessageInteractions)
              .values({
                userId: user.user.id,
                messageId: messageId,
                interactionType: action,
              });
            await db
              .update(seriesMessages)
              .set({ 
                [action]: sql`${seriesMessages[action]} + 1`
              })
              .where(eq(seriesMessages.id, messageId));
          }
    
      const updatedMessage = await db
        .select()
        .from(seriesMessages)
        .where(eq(seriesMessages.id, messageId))
        .limit(1);
    
      return NextResponse.json(updatedMessage[0]);
    } catch (error: any) {
      console.error("Error in PUT /api/auth/seriesMessages:", error);
      return NextResponse.json({ error: error?.message }, { status: 500 });
    }
  }

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
