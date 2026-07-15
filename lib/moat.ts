import Anthropic from "@anthropic-ai/sdk";

export interface MoatResult {
  moat_rating: "wide" | "narrow" | "none";
  confidence: number; // 0..1
  rationale: string;
}

const SYSTEM = `You are an equity analyst assessing a company's economic moat \
(durable competitive advantage), in the tradition of Morningstar's moat ratings.
- "wide": a strong, durable advantage likely to persist 10+ years (network \
effects, high switching costs, intangible assets/brands, cost advantages, \
efficient scale).
- "narrow": a moderate advantage likely to persist ~10 years but less certain.
- "none": no durable competitive advantage.
Base the rating on the company and any analyst notes provided. Return a \
confidence between 0 and 1 and a concise one-to-three sentence rationale.`;

// generate_moat_rating — LLM call returning a draft rating only (never auto-applied).
export async function generateMoatRating(params: {
  ticker: string;
  companyName: string;
  sector: string | null;
  notes: string | null;
  inputText?: string | null;
}): Promise<{ result: MoatResult; model: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }
  const client = new Anthropic({ apiKey });

  const context = [
    `Ticker: ${params.ticker}`,
    `Company: ${params.companyName}`,
    params.sector ? `Sector: ${params.sector}` : null,
    params.notes ? `Notes: ${params.notes}` : null,
    params.inputText ? `Analyst input:\n${params.inputText}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const model = "claude-opus-4-8";
  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Rate the economic moat for this company:\n\n${context}`,
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            moat_rating: { type: "string", enum: ["wide", "narrow", "none"] },
            confidence: { type: "number" },
            rationale: { type: "string" },
          },
          required: ["moat_rating", "confidence", "rationale"],
          additionalProperties: false,
        },
      },
    },
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text in moat-rating response.");
  }

  const parsed = JSON.parse(textBlock.text) as MoatResult;
  // Clamp confidence defensively.
  parsed.confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0));
  return { result: parsed, model };
}
