// app/api/generate-headline/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      countryName, countrySlug, currency, grossSalary, takeHomeMonthly,
      disposable, disposableUSD, taxRate, ssRate, rentMonthly, moveReason,
      jobRole, passport, safetyScore, qualityOfLife, internetSpeed,
      visaDifficulty, isEU, isEnglish, priorities, matchPercent,
    } = body;

    const cs = { USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$", SGD: "S$", AED: "AED ", CHF: "CHF ", NOK: "kr ", NZD: "NZ$" }[currency as string] ?? "€";

    const prompt = `You write brutally honest, data-driven relocation headlines for Origio — a relocation research platform.

USER PROFILE:
- Moving to: ${countryName}
- Reason: ${moveReason}
- Job: ${jobRole}
- Passport: ${passport} ${isEU ? "(EU — free movement)" : ""}
- Priorities: ${priorities?.join(", ") || "none listed"}
- Match score: ${matchPercent}%

FINANCIAL REALITY:
- Gross salary: ${cs}${Number(grossSalary).toLocaleString()}/yr
- Take-home: ${cs}${Number(takeHomeMonthly).toLocaleString()}/mo
- Rent: ${cs}${Number(rentMonthly).toLocaleString()}/mo
- Disposable after all costs: ${cs}${Number(Math.abs(disposable)).toLocaleString()}/mo ${Number(disposable) >= 0 ? "surplus" : "SHORTFALL"}
- Effective tax rate: ${taxRate}% income + ${ssRate}% social security

COUNTRY FACTS:
- Safety: ${safetyScore}/10
- Quality of life: ${qualityOfLife}/10
- Internet: ${internetSpeed}/10
- Visa difficulty: ${visaDifficulty}/5
- English spoken: ${isEnglish ? "yes" : "no"}

Write ONE headline (2–3 sentences max, ~25–40 words total). Rules:
- Lead with the most important financial or lifestyle truth for THIS specific person
- Use their actual numbers — don't be vague
- Be direct, not cheerful. No marketing speak. No "exciting opportunity"
- Contrast is good: "X gives you Y but costs Z"
- If disposable is negative, say so plainly
- If tax is very high (>40%), acknowledge the tradeoff honestly
- If it's UAE or another zero-tax country, lead with that
- Vary the structure — don't always start with salary
- Never use the word "opportunity" or "journey" or "adventure"
- Match the tone of a financial newspaper, not a travel blog

Output ONLY the headline text. No quotes. No labels. Nothing else.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 120,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.content?.[0]?.text) {
      return NextResponse.json({ headline: null });
    }

    const headline = data.content[0].text.trim().replace(/^["']|["']$/g, "");
    return NextResponse.json({ headline });

  } catch (err) {
    console.error("Headline generation error:", err);
    return NextResponse.json({ headline: null });
  }
}