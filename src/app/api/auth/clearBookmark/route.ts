// app/api/auth/clearBookmark/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/util/db";
import { bookmarks } from "@/util/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { auth } from "../../../../lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
export async function POST(request: NextRequest) {
  const user = await auth.api.getSession({
    headers: await headers()
}) 
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Clear bookmarks from the database
    await db.delete(bookmarks).where(eq(bookmarks.userId, user.user.id));
    
    // Clear the bookmarks cookie
    (await cookies()).set("bookmarks", "", { 
      maxAge: 0,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to clear bookmarks" }, { status: 500 });
  }
}