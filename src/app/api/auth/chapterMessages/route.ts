import { NextRequest, NextResponse } from "next/server";
import { db } from "@/util/db";
import { chapterMessages, userChapterMessageInteractions, user } from "@/util/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "../../../../lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
export async function POST(request: NextRequest) {
  try {
    const user = await auth.api.getSession({
      headers: await headers()
  }) 

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chapterId, content, parentId } = await request.json();

    if (content.length > 500) {
        return NextResponse.json({ error: "Content length exceeds limit" }, { status: 400 });
    }

    if (!chapterId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newMessage = await db
      .insert(chapterMessages)
      .values({
        chapterId,
        userId: user.user.id,
        content,
        parentId: parentId || null,
      })
      .returning();
    
    const message = (Array.isArray(newMessage) ? newMessage[0] : newMessage) as any;
    
    return NextResponse.json(message);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}



export async function PUT(request: NextRequest) {
    try {
      const user = await auth.api.getSession({
        headers: await headers()
    }) 
  
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
        .from(userChapterMessageInteractions)
        .where(and(
          eq(userChapterMessageInteractions.userId, user.user.id),
          eq(userChapterMessageInteractions.messageId, messageId)
        ))
        .limit(1);
  
      if (existingInteraction.length > 0) {
        if (existingInteraction[0].interactionType === action) {
          // User is trying to perform the same action again, so we'll remove their interaction
          await db
            .delete(userChapterMessageInteractions)
            .where(and(
              eq(userChapterMessageInteractions.userId, user.user.id),
              eq(userChapterMessageInteractions.messageId, messageId)
            ));
  
          await db
            .update(chapterMessages)
            .set({ 
              [action]: sql`${chapterMessages[action]} - 1`
            })
            .where(eq(chapterMessages.id, messageId));
        } else {
          // User is changing their interaction from like to dislike or vice versa
          await db
            .update(userChapterMessageInteractions)
            .set({ interactionType: action })
            .where(and(
              eq(userChapterMessageInteractions.userId, user.user.id),
              eq(userChapterMessageInteractions.messageId, messageId)
            ));
  
          await db
            .update(chapterMessages)
            .set({ 
              [action]: sql`${chapterMessages[action]} + 1`,
              [existingInteraction[0].interactionType]: sql`${chapterMessages[existingInteraction[0].interactionType]} - 1`
            })
            .where(eq(chapterMessages.id, messageId));
        }
      } else {
        // New interaction

        await db
          .insert(userChapterMessageInteractions)
          .values({
            userId: user.user.id,
            messageId: messageId,
            interactionType: action,
          });
        await db
          .update(chapterMessages)
          .set({ 
            [action]: sql`${chapterMessages[action]} + 1`
          })
          .where(eq(chapterMessages.id, messageId));
      }
  
      const updatedMessage = await db
        .select()
        .from(chapterMessages)
        .where(eq(chapterMessages.id, messageId))
        .limit(1);
  
      return NextResponse.json(updatedMessage[0]);
    } catch (error: any) {
      console.error("Error in PUT /api/chapterMessages:", error);
      return NextResponse.json({ error: error?.message }, { status: 500 });
    }
  }

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json({ error: "Missing chapterId" }, { status: 400 });
    }

    const messages = await db
      .select({
        id: chapterMessages.id,
        content: chapterMessages.content,
        createdAt: chapterMessages.createdAt,
        likes: chapterMessages.likes,
        dislikes: chapterMessages.dislikes,
        parentId: chapterMessages.parentId,
        username: user.name,
      })
      .from(chapterMessages)
      .leftJoin(user, eq(chapterMessages.userId, user.id))
      .where(eq(chapterMessages.chapterId, chapterId))
      .orderBy(chapterMessages.createdAt);

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
