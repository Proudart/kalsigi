import { db } from "../../../util/db";
import { series } from "@/util/schema";
import { ilike } from "drizzle-orm";
import { NextResponse } from "next/server";

// Simple cache to store search results
const searchCache = new Map();

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("query");

  if (search === "") {
    return NextResponse.next();
  }

  // Check if the result is already in the cache
  if (searchCache.has(search)) {
    const cachedResult = searchCache.get(search);
    return NextResponse.json(cachedResult);
  }

  const result = await db
    .select({
      title: series.title,
      url: series.url,
      url_code: series.url_code,
    })
    .from(series)
    .where(ilike(series.title, `%${search}%`))
    .limit(10);

  // Store the result in cache
  searchCache.set(search, result);

  return NextResponse.json(result);
}
