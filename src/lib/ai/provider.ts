import type { ParseProposal } from "@/lib/ai/schema";
import type { MissionContext } from "@/lib/ai/prompt";

/**
 * Abstraction over the natural-language parsing backend so the rest of the
 * app never depends on Claude or OpenAI directly. Swapping providers is a
 * one-line env var change (AI_PROVIDER), no business logic touched.
 *
 * Implementations must NEVER write to the database — they only return a
 * structured proposal for the caller to show the user for confirmation.
 */
export interface NLProvider {
  parseMissionText(text: string, context: MissionContext): Promise<ParseProposal>;
}

export class AIProviderError extends Error {}

let cachedProvider: NLProvider | null = null;

/** Server-only. Never import this from a Client Component. */
export function getNLProvider(): NLProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = (process.env.AI_PROVIDER ?? "anthropic").toLowerCase();

  if (providerName === "anthropic") {
    const { AnthropicProvider } = require("@/lib/ai/anthropic") as typeof import("@/lib/ai/anthropic");
    cachedProvider = new AnthropicProvider();
  } else if (providerName === "openai") {
    const { OpenAIProvider } = require("@/lib/ai/openai") as typeof import("@/lib/ai/openai");
    cachedProvider = new OpenAIProvider();
  } else {
    throw new AIProviderError(`Unknown AI_PROVIDER "${providerName}". Use "anthropic" or "openai".`);
  }

  return cachedProvider;
}
