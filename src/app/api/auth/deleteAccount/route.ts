// app/api/auth/delete-account/route.ts
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/util/db";
import { user, session, bookmarks, seriesHistory } from "@/util/schema";
import { eq } from "drizzle-orm";
import { auth } from "../../../../lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
export async function POST(request: NextRequest) {

  const users = await auth.api.getSession({
    headers: await headers()
}) 

  if (!users) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.transaction(async (tx) => {
      // Delete user's bookmarks
      await tx.delete(bookmarks).where(eq(bookmarks.userId, users.user.id));
      
      // Delete user's watch history
      await tx.delete(seriesHistory).where(eq(seriesHistory.userId, users.user.id));
      
      // Delete user's sessions
      await tx.delete(session).where(eq(session.userId, users.user.id));
      
      // Delete the user
      await tx.delete(user).where(eq(user.id, users.user.id));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}