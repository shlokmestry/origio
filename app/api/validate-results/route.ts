// app/api/validate-results/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeForPrompt } from "@/lib/utils";

export async function POST(request: Request): Promise<Response> {
  const limited = await rateLimit(request, { name: "validate-results", maxRequests: 10, windowSeconds: 60 });
  if (limited) return limited;

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "Unsupported Media Type" }, { status: 415 });
  }

  const authHeader = request.headers.get("Authorization");
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

  try {
    const { matches, answers } = await request.json();

    const top3 = matches.slice(0, 3).map((m: any) => ({
      name: sanitizeForPrompt(m.country.name, 50),
      matchPercent: Number(m.matchPercent) || 0,
      currency: sanitizeForPrompt(m.country.currency, 10),
      rentPerMonth: Number(m.country.data.costRentCityCentre) || 0,
      incomeTax: Number(m.country.data.incomeTaxRateMid) || 0,
      visaDifficulty: Number(m.country.data.visaDifficulty) || 0,
      language: sanitizeForPrompt(m.country.language, 30),
      reasons: Array.isArray(m.reasons) ? m.reasons.slice(0, 5).map((r: unknown) => sanitizeForPrompt(r, 60)) : [],
    }));

    const passport     = sanitizeForPrompt(answers.passport, 50);
    const moveReason   = sanitizeForPrompt(answers.moveReason, 30);
    const jobRole      = sanitizeForPrompt(answers.jobRole, 50);
    const rentBudget   = sanitizeForPrompt(answers.rentBudget, 20);
    const priorities   = Array.isArray(answers.priorities) ? answers.priorities.slice(0, 6).map((p: unknown) => sanitizeForPrompt(p, 30)).join(", ") : "";
    const languages    = Array.isArray(answers.languages)  ? answers.languages.slice(0, 5).map((l: unknown) => sanitizeForPrompt(l, 30)).join(", ") : "";
    const dealBreakers = Array.isArray(answers.dealBreakers) ? answers.dealBreakers.slice(0, 6).map((d: unknown) => sanitizeForPrompt(d, 30)).join(", ") : "";

    const prompt = `You are a relocation data validator. A user completed a relocation quiz and got these top 3 country matches. Check if the results make logical sense given their answers.

USER PROFILE:
- Passport: ${passport}
- Reason for moving: ${moveReason}
- Job role: ${jobRole}
- Priorities: ${priorities}
- Rent budget: ${rentBudget} (under800 = under €800/mo, 800to1500 = €800-1500/mo, 1500to2500 = €1500-2500/mo, any = no limit)
- Languages: ${languages}
- Deal breakers: ${dealBreakers}

TOP 3 RESULTS:
${top3.map((m: any, i: number) => `
#${i + 1}: ${m.name} (${m.matchPercent}% match)
- Rent: ${m.rentPerMonth} ${m.currency}/mo
- Tax: ${m.incomeTax}%
- Visa difficulty: ${m.visaDifficulty}/5
- Language: ${m.language}
- Match reasons: ${m.reasons?.join(", ")}
`).join("")}

VALIDATION RULES — flag if ANY of these are violated:
1. If dealBreakers includes "english" → all 3 must be English-speaking (Ireland, UK, Australia, NZ, Canada, USA, Singapore only)
2. If dealBreakers includes "lowcost" → no country with rent > €1,200/mo equivalent
3. If dealBreakers includes "lowtax" → no country with income tax > 25%
4. If dealBreakers includes "europe" → all must be European countries
5. If dealBreakers includes "warm" → no cold-climate countries (Norway, Sweden, Finland, Denmark, Canada should be excluded)
6. If rentBudget is "under800" → no country where rent equivalent exceeds €960 (€800 + 20% buffer)
7. If rentBudget is "800to1500" → no country where rent equivalent exceeds €1,800
8. If moveReason is "study" and country has high tax/cost → flag as potentially poor fit for students
9. Language mismatch: if dealBreakers includes "english" and a non-English country appears → critical error

Respond ONLY with valid JSON, no markdown, no explanation outside the JSON:
{
  "valid": true or false,
  "issues": ["list of specific issues found, empty array if none"],
  "flaggedCountries": ["list of country names that should be removed from results"],
  "confidence": "high" | "medium" | "low"
}`;

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
    }).finally(() => clearTimeout(timeout));

    const data = await res.json();

    if (!res.ok || !data.content?.[0]?.text) {
      return NextResponse.json({ valid: true, issues: [], flaggedCountries: [], confidence: "low" });
    }

    const text = data.content[0].text.trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      const result = JSON.parse(text);
      return NextResponse.json(result);
    } catch {
      return NextResponse.json({ valid: true, issues: [], flaggedCountries: [], confidence: "low" });
    }

  } catch (err) {
    console.error("Validation error:", err);
    return NextResponse.json({ valid: true, issues: [], flaggedCountries: [], confidence: "low" });
  }
}