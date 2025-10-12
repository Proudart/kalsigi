import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../util/db';
import { scanlationGroups, groupMembers, groupInvitations, series, seriesSubmissions } from '../../../../../util/schema';
import {  hasPermission } from '../../../../../util/scanlationUtils';
import { auth } from '@/lib/auth';
import { eq, count, sql, gte } from 'drizzle-orm';
import type { Session } from '@/types';


export async function GET(request: NextRequest) {
  try {
    // Get various statistics

    const session = await auth.api.getSession({ headers: request.headers }) as Session | null;

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }


    const [
      totalSeries,
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      recentSeries,
      recentSubmissions,
    ] = await Promise.all([
      // Total series count
      db.select({ count: count() }).from(series),
      
      // Total submissions count
      db.select({ count: count() }).from(seriesSubmissions),
      
      // Pending submissions
      db.select({ count: count() })
        .from(seriesSubmissions)
        .where(eq(seriesSubmissions.submission_status, 'pending')),
      
      // Approved submissions
      db.select({ count: count() })
        .from(seriesSubmissions)
        .where(eq(seriesSubmissions.submission_status, 'approved')),
      
      // Rejected submissions
      db.select({ count: count() })
        .from(seriesSubmissions)
        .where(eq(seriesSubmissions.submission_status, 'rejected')),
      
      // Series created in last 7 days
      db.select({ count: count() })
        .from(series)
        .where(gte(series.created_at, sql`NOW() - INTERVAL '7 days'`)),
      
      // Submissions in last 7 days
      db.select({ count: count() })
        .from(seriesSubmissions)
        .where(gte(seriesSubmissions.created_at, sql`NOW() - INTERVAL '7 days'`)),
    ]);

    return NextResponse.json({
      totalSeries: totalSeries[0].count,
      totalSubmissions: totalSubmissions[0].count,
      pendingSubmissions: pendingSubmissions[0].count,
      approvedSubmissions: approvedSubmissions[0].count,
      rejectedSubmissions: rejectedSubmissions[0].count,
      recentSeries: recentSeries[0].count,
      recentSubmissions: recentSubmissions[0].count,
      approvalRate: totalSubmissions[0].count > 0 
        ? Math.round((approvedSubmissions[0].count / totalSubmissions[0].count) * 100)
        : 0,
    });

  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}