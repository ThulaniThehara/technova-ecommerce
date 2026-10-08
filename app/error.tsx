"use client";

import Link from "next/link";
import { useEffect } from "react";
import { btnOutline, btnPrimary } from "@/lib/ui";

// Shown when a page throws while rendering. It deliberately never prints error.message or a
// stack: those can contain internals. `digest` is a short opaque id that matches the server log.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-28 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-brand-600">Something went wrong</p>
      <h1 className="mt-3 text-3xl font-bold text-ink-900 sm:text-4xl">We hit a problem</h1>
      <p className="mt-3 text-slate-600">
        Sorry, this page could not be loaded. Please try again; if it keeps happening, come back in a few minutes.
      </p>
      {error.digest && <p className="mt-3 text-xs text-slate-400">Reference: {error.digest}</p>}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className={`${btnPrimary} px-7 py-3`}>
          Try again
        </button>
        <Link href="/" className={`${btnOutline} px-7 py-3`}>
          Go home
        </Link>
      </div>
    </div>
  );
}
