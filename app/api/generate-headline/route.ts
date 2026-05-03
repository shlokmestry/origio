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
      rentBudget, cityVibe, languages, dealBreakers,
    } = body;

    const cs = { USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$", SGD: "S$", AED: "AED ", CHF: "CHF ", NOK: "kr ", NZD: "NZ$", INR: "₹", MYR: "RM ", JPY: "¥" }[currency as string] ?? "€";

    const isTight = Number(disposableUSD) < 500;
    const isNegative = Number(disposable) < 0;
    const isHighTax = Number(taxRate) > 38;
    const isZeroTax = countrySlug === "uae" || Number(taxRate) === 0;
    const isRetirement = moveReason === "retire";
    const isRemote = moveReason === "remote";
    const isStudent = moveReason === "study";
    const hasJobOffer = moveReason === "job";
    const wantsSafety = priorities?.includes("safety");
    const wantsTax = priorities?.includes("tax") || dealBreakers?.includes("lowtax");
    const wantsAffordability = priorities?.includes("affordability") || dealBreakers?.includes("lowcost");
    const wantsEnglish = dealBreakers?.includes("english");
    const mustBeEurope = dealBreakers?.includes("europe");
    const wantsWarm = dealBreakers?.includes("warm");

    const prompt = `You write two-sentence relocation summaries for people considering moving abroad. You sound like a knowledgeable friend who has lived in multiple countries — direct, honest, occasionally dry, never salesy.

WHO THIS PERSON IS:
- Moving to: ${countryName}
- Why moving: ${moveReason === "retire" ? "retirement / FIRE" : moveReason === "remote" ? "remote work" : moveReason === "study" ? "study abroad" : moveReason === "job" ? "has a job offer" : moveReason === "career" ? "career growth" : moveReason === "lifestyle" ? "lifestyle change" : moveReason}
- Job: ${jobRole}
- Passport: ${passport} ${isEU ? "(EU citizen — free movement applies)" : ""}
- Priorities they ranked: ${priorities?.join(", ") || "not specified"}
- Deal breakers they set: ${dealBreakers?.join(", ") || "none"}
- Rent budget: ${rentBudget === "under800" ? "under €800/mo" : rentBudget === "800to1500" ? "€800-1500/mo" : rentBudget === "1500to2500" ? "€1500-2500/mo" : "flexible"}
- City preference: ${cityVibe || "not specified"}
- Languages they speak: ${languages?.join(", ") || "English only"}
- Wants English speaking country: ${wantsEnglish ? "yes, flagged as must" : "no"}
- Must be in Europe: ${mustBeEurope ? "yes" : "no"}
- Wants warm weather: ${wantsWarm ? "yes" : "no"}

FINANCIAL REALITY FOR THIS PERSON:
- Gross salary: ${cs}${Number(grossSalary).toLocaleString()}/yr
- Monthly take-home: ${cs}${Number(takeHomeMonthly).toLocaleString()}/mo
- Monthly rent: ${cs}${Number(rentMonthly).toLocaleString()}/mo
- Disposable after all costs: ${isNegative ? "NEGATIVE — " : ""}${cs}${Number(Math.abs(disposable)).toLocaleString()}/mo ${isNegative ? "shortfall" : "surplus"}
- Tax: ${taxRate}% income tax + ${ssRate}% social security
- Zero tax country: ${isZeroTax ? "yes" : "no"}
- High tax country: ${isHighTax ? "yes" : "no"}
- Tight budget (under $500/mo surplus): ${isTight ? "yes" : "no"}
- Match score: ${matchPercent}%

COUNTRY CONTEXT:
- Safety: ${safetyScore}/10
- Quality of life: ${qualityOfLife}/10
- Internet speed: ${internetSpeed}/10
- Visa difficulty: ${visaDifficulty}/5
- English spoken: ${isEnglish ? "yes" : "no"}

RULES:
- Exactly two sentences. No more.
- First sentence: the most important truth about this specific move for this specific person. Use their actual numbers when it adds weight. No vague statements.
- Second sentence: the honest follow-up — the catch, the upside, the thing they need to hear, or what usually surprises people.
- Write like a knowledgeable friend, not a financial report. Conversational but precise.
- Never use hyphens. Never use words like "opportunity", "journey", "adventure", "exciting", "vibrant", "hub".
- Never start with the country name — vary the opening every time.
- If they're retiring: talk about what the money actually means day to day, retirement visa if available, healthcare, pace of life.
- If they're a remote worker: talk about tax situation, internet, nomad visa if available, whether the lifestyle matches.
- If they're a student: talk about tuition costs, living costs, part-time work rules, whether it's actually affordable.
- If they have a job offer: talk about the visa being sorted, what the net salary actually looks like, whether rent leaves them anything.
- If tax is a deal breaker and this country has high tax: acknowledge it directly.
- If budget is tight or negative: say so honestly. Don't soften it.
- If safety was a priority and this country scores well: mention it.
- If they flagged English and this country is English speaking: worth noting.
- If they speak the local language: that's a big deal, mention it.
- If it's UAE or zero tax: lead with that, it's the whole point.
- If they want warm weather and this fits or doesn't fit: say something about it.

Output ONLY the two sentences. No labels, no quotes, nothing else.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
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