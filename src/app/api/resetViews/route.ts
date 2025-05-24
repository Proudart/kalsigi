import { db } from "../../../util/db";
import { series, chapters } from "../../../util/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Reset series daily views
    await db
      .update(series)
      .set({ today_views: 0 })
      .execute();
    
    return NextResponse.json({ success: true, message: "Views reset successfully" });
  } catch (error) {
    console.error("Error resetting views:", error);
    return NextResponse.json(
      { error: "Failed to reset views" },
      { status: 500 }
    );
  }
}
