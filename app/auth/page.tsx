// app/auth/page.tsx
"use client";

import React from "react";
import { useState } from "react";
import { Globe2, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) {
        setError(error.message);
      } else {
        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: name,
          });
        }
        setSuccess("Account created! Check your email to confirm, then sign in.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Globe
        </button>

        <div className="glass-panel rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-8">
            <Globe2 className="w-6 h-6 text-accent" />
            <span className="font-heading text-xl font-extrabold">Origio</span>
          </div>

          <h1 className="font-heading text-2xl font-extrabold mb-2">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-text-muted text-sm mb-8">
            {mode === "signin"
              ? "Sign in to access your saved countries and reports."
              : "Join Origio to save countries and get personalised reports."}
          </p>

          <div className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-bg-elevated rounded-xl border border-border focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 text-text-primary placeholder:text-text-muted transition-colors text-sm"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-bg-elevated rounded-xl border border-border focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 text-text-primary placeholder:text-text-muted transition-colors text-sm"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full pl-11 pr-4 py-3 bg-bg-elevated rounded-xl border border-border focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 text-text-primary placeholder:text-text-muted transition-colors text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm">
              {success}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="cta-button w-full mt-6 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "signin" ? "Sign In" : "Create Account"}
          </button>

          <p className="text-center text-sm text-text-muted mt-6">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setSuccess(null);
              }}
              className="text-accent hover:underline"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}