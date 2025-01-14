import { consult } from "../../../util/schema";
import { db } from "../../../util/db";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const currentTime = new Date();

  const consultValues = JSON.parse(await request.text()) as {
    url: string;
    selectedType: string;
    email: string;
    summary: string;
  };

  const result = await db.insert(consult).values({
    url: consultValues.url,
    type: consultValues.selectedType,
    email: consultValues.email,
    summary: consultValues.summary,
    time: currentTime.toLocaleString(),
  });

  return NextResponse.json(result);
}
