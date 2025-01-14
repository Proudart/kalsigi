// app/api/auth/changePassword/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/util/db";
import { user } from "@/util/schema";
import { eq } from "drizzle-orm";
import { auth } from "../../../../lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
// import { authClient } from "../../../../lib/authClient";
export async function POST(request: NextRequest) {
  const users = await auth.api.getSession({
    headers: await headers()
}) 
  if (!users) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { oldPassword, newPassword } = await request.json();

  try {
    // const change = await authClient.resetPassword({
    //   newPassword: newPassword,
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}