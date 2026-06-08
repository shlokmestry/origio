/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [recoveryReady, setRecoveryReady] = useState(false);

  useEffect(() => {
    // Supabase puts the token in the URL hash — this exchanges it for a session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => router.push("/"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-2xl p-8">
         <Link href="/" className="flex items-center mb-8 hover:opacity-80 transition-opacity" style={{ textDecoration: 'none', fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em', color: '#f0f0e8', lineHeight: 1 }}>
          Origio
</Link>

          {done ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-accent mx-auto" />
              <h1 className="font-heading text-2xl font-extrabold">Password updated</h1>
              <p className="text-text-muted text-sm">Taking you back to the globe...</p>
            </div>
          ) : !recoveryReady ? (
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 text-accent mx-auto animate-spin" />
              <p className="text-text-muted text-sm">Verifying reset link...</p>
            </div>
          ) : (
            <>
              <h1 className="font-heading text-2xl font-extrabold mb-2">Set a new password</h1>
              <p className="text-text-muted text-sm mb-8">Choose a strong password for your Origio account.</p>

              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-bg-elevated rounded-xl border border-border focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 text-text-primary placeholder:text-text-muted transition-colors text-sm"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleReset()}
                    className="w-full pl-11 pr-4 py-3 bg-bg-elevated rounded-xl border border-border focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 text-text-primary placeholder:text-text-muted transition-colors text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleReset}
                disabled={loading || !password || !confirm}
                className="cta-button w-full mt-6 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}