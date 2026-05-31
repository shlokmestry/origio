import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limit";
import { fetchWithTimeout, sanitizeForPrompt } from "@/lib/utils";

export async function POST(req: NextRequest): Promise<Response> {
  const limited = await rateLimit(req, { name: "subscribe", maxRequests: 5, windowSeconds: 60 });
  if (limited) return limited;

  // Secondary daily cap — each call triggers a Claude Haiku generation.
  // 2 per IP per day prevents runaway cost from automation.
  const dailyCap = await rateLimit(req, { name: "subscribe-daily", maxRequests: 2, windowSeconds: 86400 });
  if (dailyCap) return dailyCap;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await req.json();
  const email          = typeof raw.email === "string" ? raw.email : "";
  const source         = sanitizeForPrompt(raw.source, 40);
  const topCountry     = sanitizeForPrompt(raw.topCountry, 60);
  const topCountryFlag = sanitizeForPrompt(raw.topCountryFlag, 10);
  const matchPercent   = Number(raw.matchPercent) || 0;
  const jobRole        = sanitizeForPrompt(raw.jobRole, 50);
  const grossSalary    = Number(raw.grossSalary) || 0;
  const netMonthly     = Number(raw.netMonthly) || 0;
  const taxRate        = Number(raw.taxRate) || 0;
  const rentCost       = Number(raw.rentCost) || 0;
  const visaLabel      = sanitizeForPrompt(raw.visaLabel, 30);
  const currency       = sanitizeForPrompt(raw.currency, 10);

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Only allow sending to the authenticated user's own email
  if (email !== user.email) {
    return NextResponse.json({ error: "Email mismatch" }, { status: 403 });
  }

  // 1. Generate personalised email with Claude
  const prompt = `You are writing a short, personal email to someone who just used Origio (findorigio.com) to find their best country to move to.

Their results:
- Top match: ${topCountryFlag} ${topCountry} (${matchPercent}% match)
- Job role: ${jobRole}
- Gross salary in ${topCountry}: ${currency}${grossSalary}/yr
- Net monthly take-home: ${currency}${netMonthly}/mo
- Income tax rate: ${taxRate}%
- Rent (city centre): ${currency}${rentCost}/mo
- Visa difficulty: ${visaLabel}

Write a short email (4 paragraphs) that:
- Opens with their specific result, country, match percentage and job role
- Mentions their actual take-home number and what it means in practice for a ${jobRole} in ${topCountry}
- Comments on the rent vs take-home ratio specifically for ${topCountry} using the real numbers
- Ends with a nudge to come back and explore more or upgrade to Pro for the full 25-country ranking at findorigio.com
- Signs off as Shlok from Origio

Tone: Direct, data-first, human. No marketing speak. No bullet points. No hyphens. No exclamation marks. Write like a smart friend who knows the data, not a newsletter. Keep it under 180 words.`;

  let emailBody = "";

  try {
    const aiRes = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const aiData = await aiRes.json();
    emailBody = aiData.content?.[0]?.text ?? "";
  } catch {
    // Fallback to static email if AI fails
    emailBody = `Hey,

You just ran the quiz and ${topCountryFlag} ${topCountry} came out on top at ${matchPercent}% for a ${jobRole}.

Your estimated take-home in ${topCountry} is ${currency}${netMonthly}/mo after ${taxRate}% income tax. With rent around ${currency}${rentCost}/mo, the ratio works out well compared to most alternatives.

Visa access is ${visaLabel} which is worth factoring into your timeline.

Run the quiz again anytime at findorigio.com. Tweak your role, budget or priorities and the ranking shifts.

Shlok
Origio`;
  }

  // 2. Send via Resend
  try {
    await fetchWithTimeout("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Shlok at Origio <hello@findorigio.com>",
        to: email,
        subject: `Your top match is ${topCountryFlag} ${topCountry} — here's what the data shows`,
        text: emailBody,
      }),
    });
  } catch (err) {
    console.error("Resend error:", err);
  }

  // 3. Add to Loops for future campaigns
  try {
    await fetchWithTimeout("https://app.loops.so/api/v1/contacts/create", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        source: source ?? "quiz_results",
        userGroup: "quiz",
        topCountry,
        topCountryFlag,
        matchPercent,
        jobRole,
      }),
    });
  } catch (err) {
    console.error("Loops error:", err);
  }

  return NextResponse.json({ success: true });
}
