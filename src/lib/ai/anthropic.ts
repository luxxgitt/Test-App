import Anthropic from "@anthropic-ai/sdk";
import { parseProposalSchema, PROPOSAL_JSON_SCHEMA, type ParseProposal } from "@/lib/ai/schema";
import { buildSystemPrompt, TOOL_NAME, type MissionContext } from "@/lib/ai/prompt";
import { AIProviderError, type NLProvider } from "@/lib/ai/provider";

const DEFAULT_MODEL = "claude-sonnet-5";

export class AnthropicProvider implements NLProvider {
  private client: Anthropic;
  private model: string;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new AIProviderError("ANTHROPIC_API_KEY is not set.");
    }
    this.client = new Anthropic({ apiKey });
    this.model = process.env.AI_MODEL || DEFAULT_MODEL;
  }

  async parseMissionText(text: string, context: MissionContext): Promise<ParseProposal> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: buildSystemPrompt(context),
      messages: [{ role: "user", content: text }],
      tools: [
        {
          name: TOOL_NAME,
          description: "Propose une création ou modification de mission à partir du texte de l'utilisateur.",
          input_schema: PROPOSAL_JSON_SCHEMA as unknown as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAME },
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    if (!toolUse) {
      throw new AIProviderError("Anthropic response did not include a tool call.");
    }

    const parsed = parseProposalSchema.safeParse(toolUse.input);
    if (!parsed.success) {
      throw new AIProviderError(`Anthropic response failed schema validation: ${parsed.error.message}`);
    }

    return parsed.data;
  }
}
