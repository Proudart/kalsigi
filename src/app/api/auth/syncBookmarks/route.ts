// /app/api/syncBookmarks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/util/db";
import { bookmarks, series } from "@/util/schema";
import { cookies } from "next/headers";
import { inArray, eq } from "drizzle-orm";
import { auth } from "../../../../lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
export async function POST(request: NextRequest) {
  try {
    const user = await auth.api.getSession({
      headers: await headers(),
    });
    const cookieStore = await cookies();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.user.id;
    const bookmarkCookie = cookieStore.get("bookmarks");
    const currentBookmarks = await db
    .select({ 
      url: series.url
    })
    .from(bookmarks)
    .innerJoin(series, eq(series.id, bookmarks.seriesId))
    .where(eq(bookmarks.userId, userId));

    const currentBookmarkUrls = currentBookmarks.map(
      (bookmark) => bookmark.url
    );
    let newBookmarkIds = [] as any;

    if (bookmarkCookie && bookmarkCookie.value) {
      const getSeriesIds = await db
        .select({ id: series.id, url: series.url })
        .from(series)
        .where(inArray(series.url, bookmarkCookie.value.split(",")));

      newBookmarkIds = getSeriesIds
        .filter((series) => !currentBookmarkUrls.includes(series.url))
        .map((series) => series.id);
    }

    if (newBookmarkIds.length > 0) {
      await db.insert(bookmarks).values(
        newBookmarkIds.map((id: { toString: () => any }) => ({
          userId,
          seriesId: id.toString(),
        }))
      );
    } else {
      cookieStore.set("bookmarks", currentBookmarkUrls.join(","), {
        maxAge: 365 * 24 * 60 * 60,
      });

      return NextResponse.json({ bookmarks: "same" });
    }

    const combinedBookmarks = [...currentBookmarkUrls, ...newBookmarkIds];
    const combinedBookmarksUrl = await db
      .select({ url: series.url })
      .from(series)
      .where(inArray(series.id, combinedBookmarks));

    cookieStore.set(
      "bookmarks",
      combinedBookmarksUrl.map((bookmark) => bookmark.url).join(","),
      { maxAge: 365 * 24 * 60 * 60 }
    );

    return NextResponse.json({ bookmarks: "synced" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
