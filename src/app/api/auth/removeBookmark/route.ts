// /app/api/removeBookmark/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/util/db';
import { bookmarks, series } from '@/util/schema';
import { and, eq } from 'drizzle-orm';
import { auth } from "../../../../lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
export async function POST(request: NextRequest) {
  try {
    const user = await auth.api.getSession({
      headers: await headers()
  })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.user.id;
    const { seriesUrl } = await request.json();
    const seriesId = await db.select({ id: series.id }).from(series).where(eq(series.url, seriesUrl));

    await db.delete(bookmarks).where(and(eq(bookmarks.userId, userId), eq(bookmarks.seriesId, seriesId[0].id)));

    return NextResponse.json({ success: 'Removed bookmark' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}