"use client";

import { useActionState } from "react";
import type { Stock } from "@/lib/types";
import type { StockFormState } from "./actions";

type StockAction = (
  state: StockFormState,
  formData: FormData,
) => Promise<StockFormState>;

const numberField = (
  name: string,
  label: string,
  defaultValue: number | null | undefined,
  step = "0.1",
) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="text-neutral-600">{label}</span>
    <input
      type="number"
      step={step}
      name={name}
      defaultValue={defaultValue ?? ""}
      className="rounded border border-neutral-300 px-2 py-1.5"
    />
  </label>
);

export function StockForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: StockAction;
  initialValues?: Partial<Stock>;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState<StockFormState, FormData>(
    action,
    { error: null },
  );

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      {state.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-600">Ticker *</span>
          <input
            type="text"
            name="ticker"
            required
            defaultValue={initialValues?.ticker ?? ""}
            className="rounded border border-neutral-300 px-2 py-1.5 uppercase"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-600">Company name *</span>
          <input
            type="text"
            name="company_name"
            required
            defaultValue={initialValues?.company_name ?? ""}
            className="rounded border border-neutral-300 px-2 py-1.5"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-600">Sector</span>
        <input
          type="text"
          name="sector"
          defaultValue={initialValues?.sector ?? ""}
          className="rounded border border-neutral-300 px-2 py-1.5"
        />
      </label>

      <fieldset className="rounded border border-neutral-200 p-4">
        <legend className="px-1 text-sm font-medium text-neutral-700">
          Fundamentals
        </legend>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {numberField(
            "revenue_cagr_5yr",
            "Revenue CAGR 5yr (%)",
            initialValues?.revenue_cagr_5yr,
          )}
          {numberField(
            "revenue_growth_consecutive_years",
            "Revenue growth streak (yrs)",
            initialValues?.revenue_growth_consecutive_years,
            "1",
          )}
          {numberField(
            "eps_cagr_5yr",
            "EPS CAGR 5yr (%)",
            initialValues?.eps_cagr_5yr,
          )}
          {numberField(
            "fcf_positive_years",
            "FCF positive (yrs)",
            initialValues?.fcf_positive_years,
            "1",
          )}
          {numberField(
            "net_profit_margin_avg",
            "Net margin avg (%)",
            initialValues?.net_profit_margin_avg,
          )}
          {numberField("roe_avg", "ROE avg (%)", initialValues?.roe_avg)}
          {numberField("roic_avg", "ROIC avg (%)", initialValues?.roic_avg)}
          {numberField(
            "debt_to_equity",
            "Debt / equity",
            initialValues?.debt_to_equity,
            "0.01",
          )}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-600">Moat rating</span>
        <select
          name="moat_rating"
          defaultValue={initialValues?.moat_rating ?? ""}
          className="rounded border border-neutral-300 px-2 py-1.5"
        >
          <option value="">— unrated —</option>
          <option value="wide">Wide</option>
          <option value="narrow">Narrow</option>
          <option value="none">None</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-600">Notes</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={initialValues?.notes ?? ""}
          className="rounded border border-neutral-300 px-2 py-1.5"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
