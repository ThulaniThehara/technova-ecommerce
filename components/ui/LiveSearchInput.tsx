"use client";

import { Loader2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { input } from "@/lib/ui";

type Props = {
  /** Page path the search belongs to, e.g. "/products" or "/admin/products". */
  action: string;
  /** The current search term from the URL (?q=). */
  initialValue: string;
  /** Other query params to keep while searching (category, stock...). Empty values are dropped. */
  preserve?: Record<string, string | undefined>;
  placeholder: string;
  ariaLabel: string;
  /** Wait this long after the last keystroke before searching. */
  debounceMs?: number;
};

/**
 * Search-as-you-type for a server-rendered list page.
 *
 * Typing updates the URL (?q=...) shortly after you pause; Next re-renders the server page with
 * the new results while this input stays mounted, so your text and cursor are never disturbed.
 * It is still a real <form>: pressing Enter searches immediately, and without JavaScript the
 * form submits as a normal GET request, so the page keeps working either way.
 */
export default function LiveSearchInput({ action, initialValue, preserve = {}, placeholder, ariaLabel, debounceMs = 300 }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();
  const timer = useRef<number | undefined>(undefined);

  // If the URL's term changes for a reason other than our own typing (e.g. a "Clear filters" link),
  // follow it. Done during render, comparing to what we last sent, so typing is never overwritten.
  const [lastSent, setLastSent] = useState(initialValue);
  const [seenFromUrl, setSeenFromUrl] = useState(initialValue);
  if (initialValue !== seenFromUrl) {
    setSeenFromUrl(initialValue);
    if (initialValue !== lastSent) {
      setValue(initialValue);
      setLastSent(initialValue);
    }
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function search(term: string) {
    const clean = term.trim();
    setLastSent(clean);
    const params = new URLSearchParams();
    for (const [key, v] of Object.entries(preserve)) if (v) params.set(key, v);
    if (clean) params.set("q", clean);
    const qs = params.toString();
    // replace (not push): each keystroke must not add a Back-button entry. scroll:false keeps the page still.
    startTransition(() => router.replace(qs ? `${action}?${qs}` : action, { scroll: false }));
  }

  function onChange(next: string) {
    setValue(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => search(next), debounceMs);
  }

  return (
    <form
      action={action}
      method="get"
      role="search"
      className="relative min-w-0 flex-1"
      onSubmit={(e) => {
        e.preventDefault();
        window.clearTimeout(timer.current);
        search(value);
      }}
    >
      {/* No-JavaScript fallback: these ride along with the plain GET submit. */}
      {Object.entries(preserve).map(([key, v]) => (v ? <input key={key} type="hidden" name={key} value={v} /> : null))}

      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={100}
        autoComplete="off"
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`${input} pl-11 pr-11 [&::-webkit-search-cancel-button]:appearance-none`}
      />
      <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin text-brand-600" aria-label="Searching" />
        ) : (
          value && (
            <button
              type="button"
              onClick={() => {
                window.clearTimeout(timer.current);
                setValue("");
                search("");
              }}
              aria-label="Clear search"
              className="rounded-md p-1 text-slate-400 transition hover:bg-surface hover:text-ink-700"
            >
              <X className="h-4 w-4" />
            </button>
          )
        )}
      </span>
    </form>
  );
}
