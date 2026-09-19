import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { PLACE_CATEGORY_LABELS, type PlaceCategory } from "./places";
import { interpretQueryLocally, INTENT_LABELS, type Intent, type StructuredQuery } from "./discovery";

const CATEGORY_KEYS = Object.keys(PLACE_CATEGORY_LABELS) as PlaceCategory[];
const INTENT_KEYS = Object.keys(INTENT_LABELS) as Intent[];

const aiSchema = z.object({
  intent: z.string(),
  service: z.string().nullable(),
  placeTypes: z.array(z.string()),
  occasion: z.string().nullable(),
  audience: z.string().nullable(),
  keywords: z.array(z.string()),
  urgency: z.string(),
  interpretation: z.string(),
  needsClarification: z.boolean(),
  clarifyQuestion: z.string().nullable(),
  clarifyOptions: z.array(z.string()),
});

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    intent: { type: "string", enum: INTENT_KEYS },
    service: { type: ["string", "null"] },
    placeTypes: { type: "array", items: { type: "string", enum: CATEGORY_KEYS } },
    occasion: { type: ["string", "null"] },
    audience: { type: ["string", "null"] },
    keywords: { type: "array", items: { type: "string" } },
    urgency: { type: "string", enum: ["normal", "emergency"] },
    interpretation: { type: "string" },
    needsClarification: { type: "boolean" },
    clarifyQuestion: { type: ["string", "null"] },
    clarifyOptions: { type: "array", items: { type: "string" } },
  },
  required: [
    "intent",
    "service",
    "placeTypes",
    "occasion",
    "audience",
    "keywords",
    "urgency",
    "interpretation",
    "needsClarification",
    "clarifyQuestion",
    "clarifyOptions",
  ],
};

const SYSTEM = `You interpret conversational questions about where a person should go, for an environmental intelligence platform.
You NEVER name, invent or recommend specific places, addresses, phone numbers, ratings or opening hours — the application matches real records itself.
Your only job is to convert the question into structured search parameters.

Rules:
- intent must be one of: ${INTENT_KEYS.join(", ")}.
- placeTypes must be drawn from: ${CATEGORY_KEYS.join(", ")}, ordered by how relevant each is.
- For health questions never diagnose and never claim a place can cure anything. Describe the need, e.g. "malaria — professional medical assessment and treatment".
- urgency is "emergency" only for life-threatening or in-progress emergencies.
- keywords: short lowercase service words the directory can match, e.g. ["hospital","malaria","emergency"].
- interpretation: one short plain sentence describing what the person is looking for.
- If the question is too vague to search well, set needsClarification true, write one short clarifying question and give 3-6 short options. Otherwise set it false, clarifyQuestion null and clarifyOptions [].`;

async function callGateway(query: string, apiKey: string): Promise<unknown | null> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-5.6-sol",
      instructions: SYSTEM,
      input: [{ role: "user", content: [{ type: "input_text", text: query }] }],
      stream: true,
      text: {
        format: { type: "json_schema", name: "place_query", strict: true, schema: jsonSchema },
      },
    }),
  });

  if (!res.ok || !res.body) {
    console.error("AI gateway error", res.status, await res.text().catch(() => ""));
    return null;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload) as {
          type?: string;
          delta?: string;
          response?: { output_text?: string };
        };
        if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
          text += evt.delta;
        } else if (evt.type === "response.completed" && evt.response?.output_text) {
          text = evt.response.output_text;
        }
      } catch {
        // ignore malformed SSE fragments
      }
    }
  }

  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/**
 * Converts a conversational question into structured search parameters.
 * Uses the AI gateway for understanding; falls back to the offline rule
 * interpreter when AI is unavailable so search always works.
 */
export const interpretQuery = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ query: z.string().min(1).max(400) }).parse(data))
  .handler(async ({ data }): Promise<StructuredQuery> => {
    const fallback = interpretQueryLocally(data.query);
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return fallback;

    try {
      const raw = await callGateway(data.query, apiKey);
      if (!raw) return fallback;
      const parsed = aiSchema.safeParse(raw);
      if (!parsed.success) return fallback;
      const v = parsed.data;

      const intent = (INTENT_KEYS as string[]).includes(v.intent) ? (v.intent as Intent) : fallback.intent;
      const placeTypes = v.placeTypes.filter((t): t is PlaceCategory =>
        (CATEGORY_KEYS as string[]).includes(t),
      );

      return {
        intent,
        service: v.service,
        placeTypes: placeTypes.length ? placeTypes : fallback.placeTypes,
        occasion: v.occasion,
        audience: v.audience,
        keywords: v.keywords.slice(0, 12),
        urgency: v.urgency === "emergency" ? "emergency" : "normal",
        sort: v.urgency === "emergency" ? ["urgency", "distance", "open now"] : ["relevance", "distance", "rating"],
        interpretation: v.interpretation,
        needsClarification: v.needsClarification,
        clarifyQuestion: v.clarifyQuestion,
        clarifyOptions: v.clarifyOptions.slice(0, 6),
        engine: "ai",
      };
    } catch (error) {
      console.error("interpretQuery failed", error);
      return fallback;
    }
  });
