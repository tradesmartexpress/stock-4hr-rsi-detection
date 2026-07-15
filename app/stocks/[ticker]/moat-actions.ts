"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateMoatRating } from "@/lib/moat";
import type { Stock } from "@/lib/types";

export interface MoatActionState {
  error: string | null;
  message: string | null;
}

type AuthedStock =
  | { ok: false; error: string }
  | {
      ok: true;
      supabase: Awaited<ReturnType<typeof createClient>>;
      user: { id: string };
      stock: Stock;
    };

async function authedStock(stockId: string): Promise<AuthedStock> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { data: stock } = await supabase
    .from("stocks")
    .select("*")
    .eq("id", stockId)
    .single();
  if (!stock) return { ok: false, error: "Stock not found." };

  return { ok: true, supabase, user, stock: stock as Stock };
}

// "Rate Moat with AI" — generates a draft rating (stored as unreviewed).
export async function rateMoatWithAI(
  stockId: string,
  ticker: string,
  _prev: MoatActionState,
  formData: FormData,
): Promise<MoatActionState> {
  const ctx = await authedStock(stockId);
  if (!ctx.ok) return { error: ctx.error, message: null };
  const { supabase, user, stock } = ctx;

  const inputText = (formData.get("input_text") as string) || null;

  let draft;
  try {
    draft = await generateMoatRating({
      ticker: stock.ticker,
      companyName: stock.company_name,
      sector: stock.sector,
      notes: stock.notes,
      inputText,
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Moat rating failed.",
      message: null,
    };
  }

  const { error } = await supabase
    .from("stocks")
    .update({
      moat_rating: draft.result.moat_rating,
      moat_rating_source: draft.model,
      moat_rating_confidence: draft.result.confidence,
      moat_rating_review_status: "unreviewed",
      notes: draft.result.rationale
        ? `${stock.notes ? stock.notes + "\n\n" : ""}AI moat rationale: ${draft.result.rationale}`
        : stock.notes,
    })
    .eq("id", stockId);

  if (error) return { error: error.message, message: null };

  await supabase.from("audit_logs").insert({
    action: "moat_ai_rated",
    entity_type: "stock",
    entity_id: stockId,
    payload: {
      ticker,
      moat_rating: draft.result.moat_rating,
      confidence: draft.result.confidence,
      source: draft.model,
    },
    actor: "user",
    user_id: user.id,
  });

  revalidatePath(`/stocks/${ticker}`);
  revalidatePath("/stocks");
  return { error: null, message: "AI moat draft generated. Review it below." };
}

// Approve the AI draft as-is.
export async function approveMoat(stockId: string, ticker: string) {
  const ctx = await authedStock(stockId);
  if (!ctx.ok) throw new Error(ctx.error);
  const { supabase, user } = ctx;

  const { error } = await supabase
    .from("stocks")
    .update({ moat_rating_review_status: "approved" })
    .eq("id", stockId);
  if (error) throw new Error(error.message);

  await supabase.from("audit_logs").insert({
    action: "moat_reviewed",
    entity_type: "stock",
    entity_id: stockId,
    payload: { ticker, review_status: "approved" },
    actor: "user",
    user_id: user.id,
  });

  revalidatePath(`/stocks/${ticker}`);
  revalidatePath("/stocks");
}

// Override the AI draft with a human-chosen rating.
export async function overrideMoat(
  stockId: string,
  ticker: string,
  rating: "wide" | "narrow" | "none",
) {
  const ctx = await authedStock(stockId);
  if (!ctx.ok) throw new Error(ctx.error);
  const { supabase, user } = ctx;

  const { error } = await supabase
    .from("stocks")
    .update({
      moat_rating: rating,
      moat_rating_source: "manual",
      moat_rating_review_status: "overridden",
    })
    .eq("id", stockId);
  if (error) throw new Error(error.message);

  await supabase.from("audit_logs").insert({
    action: "moat_reviewed",
    entity_type: "stock",
    entity_id: stockId,
    payload: { ticker, review_status: "overridden", moat_rating: rating },
    actor: "user",
    user_id: user.id,
  });

  revalidatePath(`/stocks/${ticker}`);
  revalidatePath("/stocks");
}
