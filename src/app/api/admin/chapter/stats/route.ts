import { NextRequest, NextResponse } from "next/server";
import { db } from '../../../../../util/db';
import { chapterSubmissions } from '../../../../../util/schema';
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get submission statistics
    const stats = await db
      .select({
        status: chapterSubmissions.status,
        count: sql<number>`count(*)`
      })
      .from(chapterSubmissions)
      .groupBy(chapterSubmissions.status);

    // Format stats into an object
    const formattedStats = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    stats.forEach(stat => {
      if (stat.status in formattedStats) {
        formattedStats[stat.status as keyof typeof formattedStats] = stat.count;
      }
    });

    // Get recent activity (last 7 days)
    const recentActivity = await db
      .select({
        date: sql<string>`DATE(${chapterSubmissions.created_at})`,
        count: sql<number>`count(*)`
      })
      .from(chapterSubmissions)
      .where(sql`${chapterSubmissions.created_at} >= NOW() - INTERVAL '7 days'`)
      .groupBy(sql`DATE(${chapterSubmissions.created_at})`)
      .orderBy(sql`DATE(${chapterSubmissions.created_at})`);

    return NextResponse.json({
      success: true,
      stats: formattedStats,
      recentActivity
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}