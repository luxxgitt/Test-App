"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">Missions</h1>
        <p className="mb-8 text-sm text-neutral-500">Connexion propriétaire</p>

        {status === "sent" ? (
          <p className="rounded-2xl bg-neutral-100 p-4 text-sm leading-relaxed">
            Lien de connexion envoyé à <strong>{email}</strong>.
            <br />
            Ouvre-le depuis ce téléphone pour te connecter.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-base outline-none focus:border-neutral-900"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-2xl bg-neutral-900 px-4 py-3 text-base font-medium text-white transition active:scale-[0.99] disabled:opacity-50"
            >
              {status === "sending" ? "Envoi..." : "Recevoir le lien de connexion"}
            </button>
            {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
