/**
 * Shared class strings for the TechNova UI.
 * Keeping them here (rather than retyping Tailwind chains in every file) is what makes
 * buttons, cards and inputs look identical on the storefront and in the admin panel.
 */

export const card = "rounded-xl border border-line bg-white";
export const cardPad = `${card} p-5 sm:p-6`;

export const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed";

export const btnPrimary = `${btnBase} bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/50`;
export const btnDark = `${btnBase} bg-ink-900 text-white hover:bg-ink-800 disabled:opacity-50`;
export const btnOutline = `${btnBase} border border-line bg-white text-ink-900 hover:bg-surface disabled:opacity-50`;
export const btnGhost = `${btnBase} text-ink-600 hover:bg-surface`;

export const input =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export const inputError =
  "w-full rounded-xl border border-red-400 bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-slate-400 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100";

export const label = "mb-1.5 block text-sm font-semibold text-ink-900";

export const sectionTitle = "text-xl font-bold text-ink-900 sm:text-2xl";

/** Soft tinted pill, e.g. "Popular", "Low Stock", a status chip. */
export const pill = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";
