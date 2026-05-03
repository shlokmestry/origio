import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    email,
    source,
    topCountry,
    topCountryFlag,
    matchPercent,
    jobRole,
    grossSalary,
    netMonthly,
    taxRate,
    rentCost,
    visaLabel,
    currency,
  } = await req.json();

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

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
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
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
    await fetch("https://api.resend.com/emails", {
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
    await fetch("https://app.loops.so/api/v1/contacts/create", {
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



