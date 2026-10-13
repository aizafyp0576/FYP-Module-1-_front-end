"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Sidebar";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (error || !data.user) {
      setLoading(false);
      if (error && /banned/i.test(error.message)) setError("This account has been deactivated. Contact your System Admin.");
      else setError("Incorrect email or password.");
      return;
    }

    const { data: profile } = await supabase.from("users").select("is_active").eq("user_id", data.user.id).maybeSingle();
    if (!profile || !profile.is_active) {
      await supabase.auth.signOut();
      setLoading(false);
      setError(!profile ? "Your login has no user profile yet. Ask the System Admin to set you up." : "This account has been deactivated.");
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-brand-900 p-12 lg:flex lg:flex-col lg:justify-between">
        <Weave />
        <div className="relative"><Logo /></div>
        <div className="relative max-w-md">
          <h1 className="text-3xl font-semibold leading-tight text-white">One connected view of every batch, from order to dispatch.</h1>
          <p className="mt-4 text-brand-100/80">
            System Administration — manage users, roles, departments and processing targets for the Al-Hamra production floor.
          </p>
        </div>
        <p className="relative text-xs text-brand-200/60">Integrated Textile Management &amp; Analytics Platform</p>
      </section>

      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Al-Hamra Textile Industries (Pvt) Ltd." className="mb-8 h-24 w-auto" />
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Log in</h2>
          <p className="mt-1 text-sm text-slate-500">Use the email and password given by your System Admin.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" autoComplete="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@alhamratextile.com" />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" type="password" autoComplete="current-password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? "Signing in…" : "Log in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Weave() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
      <defs>
        <pattern id="weave" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M0 7h14M14 21h14" stroke="#fff" strokeWidth="5" />
          <path d="M21 0v14M7 14v14" stroke="#fff" strokeWidth="5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#weave)" />
    </svg>
  );
}
