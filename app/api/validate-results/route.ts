// app/api/validate-results/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { matches, answers } = await request.json();

    const top3 = matches.slice(0, 3).map((m: any) => ({
      name: m.country.name,
      matchPercent: m.matchPercent,
      currency: m.country.currency,
      rentPerMonth: m.country.data.costRentCityCentre,
      incomeTax: m.country.data.incomeTaxRateMid,
      visaDifficulty: m.country.data.visaDifficulty,
      language: m.country.language,
      reasons: m.reasons,
    }));

    const prompt = `You are a relocation data validator. A user completed a relocation quiz and got these top 3 country matches. Check if the results make logical sense given their answers.

USER PROFILE:
- Passport: ${answers.passport}
- Reason for moving: ${answers.moveReason}
- Job role: ${answers.jobRole}
- Priorities: ${answers.priorities?.join(", ")}
- Rent budget: ${answers.rentBudget} (under800 = under €800/mo, 800to1500 = €800-1500/mo, 1500to2500 = €1500-2500/mo, any = no limit)
- Languages: ${answers.languages?.join(", ")}
- Deal breakers: ${answers.dealBreakers?.join(", ")}

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

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
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
    });

    const data = await res.json();

    if (!res.ok || !data.content?.[0]?.text) {
      // Validation failed silently — don't block the user
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
    // Never block the user — fail silently
    return NextResponse.json({ valid: true, issues: [], flaggedCountries: [], confidence: "low" });
  }
}