// app/api/feedback/route.ts
import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = await rateLimit(request, { name: "feedback", maxRequests: 3, windowSeconds: 60 });
  if (limited) return limited;

  try {
    const { email, message } = await request.json();

    if (!message || message.trim().length < 5) {
      return NextResponse.json({ error: "Message too short" }, { status: 400 });
    }
    if (message.length > 300) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    // Email yourself
    await resend.emails.send({
      from: "Origio Feedback <onboarding@resend.dev>",
      to: "shlok@findorigio.com",
      subject: `New feedback${email ? ` from ${email}` : " (anonymous)"}`,
      html: `
        <div style="font-family:monospace;max-width:600px;padding:24px;background:#0a0a0a;color:#f0f0e8;">
          <h2 style="color:#00ffd5;text-transform:uppercase;letter-spacing:0.1em;font-size:14px;margin:0 0 16px">New Origio Feedback</h2>
          <div style="border:1px solid #2a2a2a;padding:16px;margin-bottom:16px;">
            <p style="color:#888880;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Message</p>
            <p style="font-size:14px;line-height:1.6;margin:0;color:#f0f0e8;">${message}</p>
          </div>
          <div style="border:1px solid #2a2a2a;padding:16px;">
            <p style="color:#888880;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Email</p>
            <p style="font-size:14px;margin:0;color:#f0f0e8;">${email ? email : "Not provided"}</p>
          </div>
        </div>
      `,
    });

    // If email provided, send them a confirmation
    if (email && email.includes("@")) {
      await resend.emails.send({
        from: "Shlok at Origio <onboarding@resend.dev>",
        to: email,
        subject: "Got your feedback — thanks",
        html: `
          <div style="font-family:monospace;max-width:600px;padding:24px;background:#0a0a0a;color:#f0f0e8;">
            <div style="margin-bottom:24px;">
              <div style="width:12px;height:12px;background:#00ffd5;display:inline-block;margin-right:8px;"></div>
              <span style="font-weight:bold;text-transform:uppercase;letter-spacing:0.05em;">Origio</span>
            </div>
            <h2 style="font-size:20px;margin:0 0 16px;text-transform:uppercase;letter-spacing:-0.01em;">Got it.</h2>
            <p style="font-size:14px;color:#888880;line-height:1.6;margin:0 0 16px;">Your message came through. I read every one of these and use them to decide what to build next.</p>
            <p style="font-size:14px;color:#888880;line-height:1.6;margin:0 0 24px;">If you left a request for a country or feature, I'll email you here when it's live.</p>
            <div style="border-top:1px solid #2a2a2a;padding-top:16px;">
              <p style="font-size:12px;color:#888880;margin:0;">Shlok · <a href="https://findorigio.com" style="color:#00ffd5;text-decoration:none;">findorigio.com</a></p>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Feedback error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}