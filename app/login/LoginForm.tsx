"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";

export function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    action,
    { error: null, message: null },
  );

  return (
    <div className="mx-auto mt-24 max-w-sm px-6">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">
        {mode === "signin" ? "Sign in" : "Create account"}
      </h1>
      <p className="mb-6 text-sm text-neutral-500">
        RSI Alert Watchlist — your fundamentals-screened stock alerts.
      </p>

      <form action={formAction} className="flex flex-col gap-4">
        {state.error && (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        {state.message && (
          <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
            {state.message}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-600">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="rounded border border-neutral-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-600">Password</span>
          <input
            type="password"
            name="password"
            required
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            className="rounded border border-neutral-300 px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending
            ? "Please wait…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-4 text-sm text-neutral-500 hover:text-neutral-900"
      >
        {mode === "signin"
          ? "Need an account? Sign up"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
