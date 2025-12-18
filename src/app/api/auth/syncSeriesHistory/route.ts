import { NextRequest, NextResponse } from "next/server";
import { db } from "@/util/db";
import { seriesHistory } from "@/util/schema";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import pako from   "pako";
import { auth } from "../../../../lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
import { generateId } from "better-auth";
// Helper functions for compression and decompression
function compressData(data: any): string {
  const compressed = pako.deflate(JSON.stringify(data));
  return Buffer.from(compressed).toString("base64");
}

function decompressData(input: string): any {
  try {
    const compressed = Buffer.from(input, "base64");
    const decompressed = pako.inflate(compressed);
    const jsonString = new TextDecoder().decode(decompressed);
    return JSON.parse(jsonString);
  } catch (error) {
    // If decompression fails, assume the input is not compressed
    return JSON.parse(input);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await cookies()).get("seriesHistory")) {
      (await cookies()).set("seriesHistory", "[]", { maxAge: 365 * 24 * 60 * 60 });
    }

    const user = await auth.api.getSession({
      headers: await headers(),
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.user.id;
    const continueReadingCookie = decompressData(
      (await cookies()).get("seriesHistory")?.value as string
    );


    const currentSeriesHistory = await db
      .select({ history: seriesHistory.history })
      .from(seriesHistory)
      .where(eq(seriesHistory.userId, userId));

    const dbHistory =
      currentSeriesHistory.length > 0
        ? decompressData(currentSeriesHistory[0].history as string)
        : [];
    const combinedSeriesHistory = [...dbHistory];

    if (
      JSON.stringify(continueReadingCookie) ===
      JSON.stringify(combinedSeriesHistory)
    ) {
      return NextResponse.json({ continueReading: "same" });
    }

    continueReadingCookie.forEach(
      (series: {
        title: any;
        chapter: string;
        timestamp: string | number | Date;
        latest: string;
      }) => {
        const existingSeries = combinedSeriesHistory.find(
          (history) => history.title === series.title
        );

        if (existingSeries) {
          const latestChapter = Math.max(
            parseInt(series.chapter),
            parseInt(existingSeries.chapter)
          );

          const latestLatest = Math.max(
            parseInt(series.latest),
            parseInt(existingSeries.latest)
          );

          const latestTimestamp = Math.max(
            new Date(series.timestamp).getTime(),
            new Date(existingSeries.timestamp).getTime()
          );

          existingSeries.chapter = latestChapter
          existingSeries.latest = latestLatest
          existingSeries.timestamp = new Date(latestTimestamp).toISOString();
        } else {
          combinedSeriesHistory.push(series);
        }
      }
    );

    const compressedCombinedHistory = compressData(combinedSeriesHistory);
    (await cookies()).set("seriesHistory", compressedCombinedHistory, {
      maxAge: 365 * 24 * 60 * 60,
    });

    await db
      .insert(seriesHistory)
      .values({
        id: generateId(15),
        userId,
        history: compressedCombinedHistory,
      })
      .onConflictDoUpdate({
        target: [seriesHistory.userId],
        set: {
          history: compressedCombinedHistory,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ continueReading: "synced" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

// ... (rest of the code remains the same)

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
