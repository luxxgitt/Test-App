import OpenAI from "openai";
import { parseProposalSchema, PROPOSAL_JSON_SCHEMA, type ParseProposal } from "@/lib/ai/schema";
import { buildSystemPrompt, TOOL_NAME, type MissionContext } from "@/lib/ai/prompt";
import { AIProviderError, type NLProvider } from "@/lib/ai/provider";

const DEFAULT_MODEL = "gpt-4o-mini";

export class OpenAIProvider implements NLProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AIProviderError("OPENAI_API_KEY is not set.");
    }
    this.client = new OpenAI({ apiKey });
    this.model = process.env.AI_MODEL || DEFAULT_MODEL;
  }

  async parseMissionText(text: string, context: MissionContext): Promise<ParseProposal> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: buildSystemPrompt(context) },
        { role: "user", content: text },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: TOOL_NAME,
            description: "Propose une création ou modification de mission à partir du texte de l'utilisateur.",
            parameters: PROPOSAL_JSON_SCHEMA as unknown as Record<string, unknown>,
          },
        },
      ],
      tool_choice: {
        type: "function",
        function: { name: TOOL_NAME },
      },
    });

    const toolCall = completion.choices[0]?.message.tool_calls?.[0];
    if (!toolCall || toolCall.type !== "function") {
      throw new AIProviderError("OpenAI response did not include a tool call.");
    }

    let rawArgs: unknown;
    try {
      rawArgs = JSON.parse(toolCall.function.arguments);
    } catch {
      throw new AIProviderError("OpenAI response tool arguments were not valid JSON.");
    }

    const parsed = parseProposalSchema.safeParse(rawArgs);
    if (!parsed.success) {
      throw new AIProviderError(`OpenAI response failed schema validation: ${parsed.error.message}`);
    }

    return parsed.data;
  }
}
