"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface StockFormState {
  error: string | null;
}

function numOrNull(formData: FormData, key: string): number | null {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

function textOrNull(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.trim() === "") return null;
  return raw.trim();
}

function stockPayload(formData: FormData) {
  return {
    ticker: (formData.get("ticker") as string)?.trim().toUpperCase(),
    company_name: (formData.get("company_name") as string)?.trim(),
    sector: textOrNull(formData, "sector"),
    revenue_cagr_5yr: numOrNull(formData, "revenue_cagr_5yr"),
    revenue_growth_consecutive_years: numOrNull(
      formData,
      "revenue_growth_consecutive_years",
    ),
    eps_cagr_5yr: numOrNull(formData, "eps_cagr_5yr"),
    fcf_positive_years: numOrNull(formData, "fcf_positive_years"),
    net_profit_margin_avg: numOrNull(formData, "net_profit_margin_avg"),
    roe_avg: numOrNull(formData, "roe_avg"),
    roic_avg: numOrNull(formData, "roic_avg"),
    debt_to_equity: numOrNull(formData, "debt_to_equity"),
    moat_rating: textOrNull(formData, "moat_rating"),
    notes: textOrNull(formData, "notes"),
  };
}

export async function createStock(
  _prevState: StockFormState,
  formData: FormData,
): Promise<StockFormState> {
  const payload = stockPayload(formData);

  if (!payload.ticker || !payload.company_name) {
    return { error: "Ticker and company name are required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to add a stock." };
  }

  const { error } = await supabase
    .from("stocks")
    .insert({ ...payload, user_id: user.id });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/stocks");
  redirect("/stocks");
}

export async function updateStock(
  id: string,
  _prevState: StockFormState,
  formData: FormData,
): Promise<StockFormState> {
  const payload = stockPayload(formData);

  if (!payload.ticker || !payload.company_name) {
    return { error: "Ticker and company name are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("stocks").update(payload).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/stocks");
  revalidatePath(`/stocks/${payload.ticker}`);
  redirect(`/stocks/${payload.ticker}`);
}

export async function deleteStock(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("stocks").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/stocks");
  redirect("/stocks");
}
