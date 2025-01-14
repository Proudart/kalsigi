import { db } from "../../../util/db";
import { NextResponse } from "next/server";

// Simple cache to store offset results
const cache = new Map();

export async function GET(request: Request) {
  // Check if the result is already cached
  if (cache.has("search-all")) {
    return NextResponse.json(cache.get("search-all"));
  }

  const result = await db.query.series.findMany({
    columns: {
      title: true,
      url: true,
    },
  });

  // Cache the result
  cache.set("search-all", result);

  return NextResponse.json(result);
}
