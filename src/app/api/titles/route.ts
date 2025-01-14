import { db } from "../../../util/db";
import { NextResponse } from "next/server";

// Simple cache to store url results

export async function GET(request: Request) {
  try {

    const result = await db.query.series.findMany({
      columns: {
        url: true,
        url_code: true,
      },
    });
    // Handle case when result is not found
    if (!result) {
      return new NextResponse(JSON.stringify("Not Found"), { status: 404 });
    }

    // Take res.chapterss and sort it by update_time
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    });

    const d = new Date();
    const time = d.getTime();
    // Convert date to string 1 day ago, 2 days ago, etc

    // Store the result in cache

    return NextResponse.json(result);
  } catch (error) {
    // Handle any errors that occur during the execution
    console.error("An error occurred:", error);
    return new NextResponse(JSON.stringify(error), { status: 500 });
  }
}
