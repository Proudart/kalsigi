import { NextRequest, NextResponse } from "next/server";
import { db } from '../../../../../util/db';
import { series } from '../../../../../util/schema';
import { eq, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // Fetch all approved series that groups can submit chapters for
    // You might want to add additional filtering here based on your business logic
    // For example, only series that the group has rights to translate
    const availableSeries = await db
      .select({
        id: series.id,
        title: series.title,
        type: series.type,
        status: series.status,
      })
      .from(series)
      .orderBy(asc(series.title));

    return NextResponse.json({
      success: true,
      series: availableSeries,
    });

  } catch (error) {
    console.error("Error fetching available series:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch available series" },
      { status: 500 }
    );
  }
}