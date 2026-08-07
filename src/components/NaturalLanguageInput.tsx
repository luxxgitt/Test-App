"use client";

import { useState, type FormEvent } from "react";

export function NaturalLanguageInput({
  onSubmit,
  loading,
}: {
  onSubmit: (text: string) => void;
  loading: boolean;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text || loading) return;
    onSubmit(text);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ajouter ou modifier une mission…"
        enterKeyHint="send"
        autoComplete="off"
        className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-base shadow-sm outline-none focus:border-neutral-900"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="flex w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-lg text-white transition active:scale-95 disabled:opacity-40"
        aria-label="Envoyer"
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          "→"
        )}
      </button>
    </form>
  );
}
