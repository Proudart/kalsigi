import { db } from "../../../util/db";
import { series } from "@/util/schema";
import { inArray } from "drizzle-orm";

// Simple cache to store bookmark results
const searchCache = new Map();

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const bookmark = searchParams.get("series");

  if (bookmark === null || bookmark === undefined || bookmark === "") {
    // Return a 400 Bad Request response
    return new Response("Invalid request", { status: 400 });
  }

  // Check if the result is already in the cache
  if (searchCache.has(bookmark)) {
    const cachedResult = searchCache.get(bookmark);
    return new Response(JSON.stringify(cachedResult), { status: 200 });
  }

  
  const result = await db
    .select({
      title: series.title,
      url: series.url,
      cover_image_url: series.cover_image_url,
    })
    .from(series)
    .where(inArray(series.url, bookmark.split(",")));

  // Store the result in cache
  searchCache.set(bookmark, result);

  return new Response(JSON.stringify(result), { status: 200 });
}
