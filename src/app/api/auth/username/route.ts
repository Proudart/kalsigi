// /app/api/ifPremium/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/util/db';
import { and, eq, sql } from 'drizzle-orm';
import { auth } from "../../../../lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
    try {
        const user = await auth.api.getSession({
            headers: await headers()
        });

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = user.user.id;
        const premiumUser = await db.query.premiumUsers.findFirst({
            where: (table) => and(eq(table.userId, userId), sql`${table.startDate} <= now() AND ${table.expirationDate} >= now()`),
        });

       const isPremium = premiumUser ? true : false;

        const userRecord = await db.query.user.findFirst({
            where: (table: { id: any; }) => eq(table.id, userId),
        });

        if (!userRecord) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ isPremium: isPremium, username: userRecord.name });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function PUT(request: NextRequest) {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function PATCH(request: NextRequest) {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}