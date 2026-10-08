"use client";

import { X } from "lucide-react";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { safeRedirect } from "@/lib/redirect";
import CustomerAuthForm from "./CustomerAuthForm";

type Mode = "login" | "signup";
type Open = { mode: Mode; redirectTo: string } | null;

const Ctx = createContext<{
  signedIn: boolean;
  /** Show the sign in / sign up pop-up. `redirectTo` is where to go afterwards (default: this same page). */
  openAuth: (mode: Mode, redirectTo?: string) => void;
}>({ signedIn: false, openAuth: () => {} });

export const useAuthModal = () => useContext(Ctx);

const copy: Record<Mode, { title: string; subtitle: string }> = {
  login: { title: "Welcome back", subtitle: "Sign in to your TechNova account." },
  signup: { title: "Create your account", subtitle: "Track your orders and check out faster." },
};

/**
 * Sign in / sign up as a pop-up over the current page, with the background blurred, so the
 * customer never leaves what they were looking at. After success the page reloads in place
 * (or continues to checkout). The /login and /signup pages still exist for direct links.
 */
export default function AuthModalProvider({ signedIn, children }: { signedIn: boolean; children: ReactNode }) {
  const [state, setState] = useState<Open>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const openAuth = useCallback((mode: Mode, redirectTo?: string) => {
    // Validated like every other redirect target; the default is the page the customer is on.
    const here = `${window.location.pathname}${window.location.search}`;
    setState({ mode, redirectTo: safeRedirect(redirectTo ?? here, "/") });
  }, []);
  const close = useCallback(() => setState(null), []);

  // While open: Escape closes, the page behind does not scroll, and focus moves into the dialog.
  useEffect(() => {
    if (!state) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>("input")?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [state, close]);

  const fromCheckout = state?.redirectTo.startsWith("/checkout");

  return (
    <Ctx.Provider value={{ signedIn, openAuth }}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-ink-900/40 px-4 py-6 backdrop-blur-sm sm:items-center sm:py-10"
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="relative w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-surface hover:text-ink-900"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            <h2 id="auth-modal-title" className="pr-10 text-2xl font-bold tracking-tight text-ink-900">
              {copy[state.mode].title}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">{copy[state.mode].subtitle}</p>

            {fromCheckout && (
              <div role="status" className="mt-5 rounded-xl border border-brand-200 bg-brand-50 p-3.5 text-sm text-ink-700">
                <p className="font-semibold">Please sign in or create an account to continue to checkout.</p>
                <p className="mt-1 text-slate-600">Your cart is saved.</p>
              </div>
            )}

            <div className="mt-6">
              <CustomerAuthForm
                key={state.mode}
                mode={state.mode}
                redirectTo={state.redirectTo}
                onSwitch={(mode) => setState({ ...state, mode })}
              />
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
