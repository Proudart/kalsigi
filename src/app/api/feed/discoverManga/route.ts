// app/api/discoverManga/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/util/db";
import { series } from "@/util/schema";
import { ilike, and, sql } from "drizzle-orm";

export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "";
    const limit = 10;
    console.log('search:', genre);
    let query = sql`
      SELECT
        title,
        url,
        cover_image_url,
        url_code
      FROM
        ${series}
      WHERE
        1=1
    `;

    if (search) {
      query = sql`${query} AND title ILIKE ${`%${search}%`}`;
    }

    if (genre) {
      query = sql`${query} AND ${genre} = ANY(genres)`;
    }

    if (!search && !genre) {
      query = sql`${query} ORDER BY RANDOM() LIMIT ${limit}`;
    } else {
      query = sql`${query} ORDER BY total_views DESC LIMIT ${limit}`;
    }

    const results = await db.execute(query);

    const transformedData = results.rows.map((row: any) => ({
      title: row.title,
      url: row.url,
      url_code: row.url_code,
      cover_image_url: row.cover_image_url,
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error discovering manga:', error);
    return NextResponse.json(
      { error: "An error occurred while discovering manga" },
      { status: 500 }
    );
  }
}
