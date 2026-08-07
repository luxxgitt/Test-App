import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

export const missionStatusSchema = z.enum([
  "possible",
  "probable",
  "confirmed",
  "cancelled",
]);

export const draftMissionSchema = z.object({
  destination: z.string().min(1),
  start_date: isoDate,
  end_date: isoDate,
  is_approximate: z.boolean(),
  approx_label: z.string().nullable(),
  status: missionStatusSchema,
  note: z.string().nullable(),
});
export type DraftMission = z.infer<typeof draftMissionSchema>;

const candidateSchema = z.object({
  mission_id: z.string(),
  destination: z.string(),
  start_date: isoDate,
  end_date: isoDate,
  status: missionStatusSchema,
});

/**
 * What the AI provider is allowed to return. It never touches the database —
 * this is only ever a *proposal* shown to the owner for confirmation.
 */
export const parseProposalSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create"), mission: draftMissionSchema }),
  z.object({
    action: z.literal("update"),
    mission_id: z.string(),
    changes: draftMissionSchema.partial(),
  }),
  z.object({
    action: z.literal("clarify"),
    question: z.string(),
    candidates: z.array(candidateSchema),
    /** Change to apply to whichever candidate the user picks, once resolved. */
    changes: draftMissionSchema.partial(),
  }),
  z.object({ action: z.literal("unrecognized"), message: z.string() }),
]);
export type ParseProposal = z.infer<typeof parseProposalSchema>;

/**
 * Hand-authored JSON Schema mirroring parseProposalSchema above, passed to
 * both providers as a forced tool/function call so we get structured output
 * from either Claude or OpenAI without duplicating parsing logic. Keep in
 * sync with parseProposalSchema when the shape changes.
 */
export const PROPOSAL_JSON_SCHEMA = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: ["create", "update", "clarify", "unrecognized"],
    },
    mission: {
      type: "object",
      description: "Required when action = create.",
      properties: {
        destination: { type: "string" },
        start_date: { type: "string", description: "YYYY-MM-DD, best guess" },
        end_date: { type: "string", description: "YYYY-MM-DD, best guess" },
        is_approximate: { type: "boolean" },
        approx_label: {
          type: ["string", "null"],
          description: "Human label when is_approximate is true, e.g. 'Semaine du 14 septembre'",
        },
        status: {
          type: "string",
          enum: ["possible", "probable", "confirmed", "cancelled"],
        },
        note: { type: ["string", "null"] },
      },
      required: [
        "destination",
        "start_date",
        "end_date",
        "is_approximate",
        "approx_label",
        "status",
        "note",
      ],
    },
    mission_id: {
      type: "string",
      description: "Required when action = update. Id of the existing mission to change.",
    },
    changes: {
      type: "object",
      description:
        "Required when action = update (only the fields that change) or action = clarify (the change to apply once the user picks a candidate).",
      properties: {
        destination: { type: "string" },
        start_date: { type: "string" },
        end_date: { type: "string" },
        is_approximate: { type: "boolean" },
        approx_label: { type: ["string", "null"] },
        status: {
          type: "string",
          enum: ["possible", "probable", "confirmed", "cancelled"],
        },
        note: { type: ["string", "null"] },
      },
    },
    question: {
      type: "string",
      description: "Required when action = clarify.",
    },
    candidates: {
      type: "array",
      description: "Required when action = clarify.",
      items: {
        type: "object",
        properties: {
          mission_id: { type: "string" },
          destination: { type: "string" },
          start_date: { type: "string" },
          end_date: { type: "string" },
          status: {
            type: "string",
            enum: ["possible", "probable", "confirmed", "cancelled"],
          },
        },
        required: ["mission_id", "destination", "start_date", "end_date", "status"],
      },
    },
    message: {
      type: "string",
      description: "Required when action = unrecognized. Short explanation for the user.",
    },
  },
  required: ["action"],
} as const;
