import { db } from "../../../util/db";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await db.query.series.findMany({
    columns: {
      url: true,
      url_code: true,
    },
    with: {
      chapters: {
        columns: {
          chapter_number: true,
        },
      },
    },
  });

  return NextResponse.json(result);
}
