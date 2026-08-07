"use client";

import { useState } from "react";

export function ShareLinkPanel({ initialToken }: { initialToken: string | null }) {
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const url = token && typeof window !== "undefined" ? `${window.location.origin}/share/${token}` : "";

  async function regenerate() {
    if (token && !window.confirm("Régénérer le lien invalide immédiatement l'ancien lien. Continuer ?")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/share", { method: "POST" });
      const data = await res.json();
      if (res.ok) setToken(data.token);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-neutral-700"
      >
        Partager avec ma femme
        <span className="text-neutral-400">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-neutral-100 px-4 py-4">
          {token ? (
            <>
              <p className="text-xs text-neutral-500">Lien en lecture seule, sans compte requis :</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={url}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 truncate rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600"
                />
                <button
                  onClick={copy}
                  className="shrink-0 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700"
                >
                  {copied ? "Copié" : "Copier"}
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-neutral-500">Aucun lien généré pour l&apos;instant.</p>
          )}
          <button
            onClick={regenerate}
            disabled={loading}
            className="w-full rounded-xl border border-neutral-200 py-2.5 text-xs font-medium text-neutral-700 disabled:opacity-50"
          >
            {loading ? "…" : token ? "Régénérer le lien" : "Générer le lien"}
          </button>
        </div>
      )}
    </div>
  );
}
