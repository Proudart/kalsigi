// /app/api/currentUser/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
export async function GET(request: NextRequest) {
  try {
  const session = await auth.api.getSession({
    headers: await headers()
})
  if (!session) {
    return NextResponse.json({ error: "No account found" });
  }
    return NextResponse.json({ name: session.user.name!});
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

