import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, source } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const res = await fetch("https://app.loops.so/api/v1/contacts/create", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.LOOPS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      source: source ?? "quiz_results",
      userGroup: "quiz",
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}