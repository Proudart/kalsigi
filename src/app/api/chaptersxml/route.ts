import { db } from "../../../util/db";
import { NextResponse } from "next/server";

// Simple cache to store url results

export async function GET() {
  const result = await db.query.series.findMany({
    columns: {
      url: true,
      updated_at: true,
      url_code: true,
    },
    with: {
      chapters: {
        columns: {
          chapter_number: true,
          published_at: true,
          
        },
      },
    },
  });

  return NextResponse.json(result);
}
