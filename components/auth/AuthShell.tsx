import { ArrowLeft, CreditCard, PackageSearch, ShieldCheck, ShoppingCart } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const benefits = [
  { icon: PackageSearch, title: "Track every order", text: "See each order move from placed to delivered." },
  { icon: ShoppingCart, title: "Your cart follows you", text: "Start on your laptop, finish on your phone." },
  { icon: CreditCard, title: "Secure checkout", text: "Pay with PayHere or order through WhatsApp." },
];

/**
 * Shared frame for the customer sign-in and sign-up pages: a brand panel with the benefits of an
 * account on large screens, and the form beside it. On phones only the form is shown.
 */
export default function AuthShell({
  title,
  subtitle,
  notice,
  children,
}: {
  mode?: "login" | "signup";
  title: string;
  subtitle?: string;
  notice?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-8 sm:py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-line bg-white shadow-[0_24px_60px_-24px_rgba(13,26,47,0.18)] lg:grid-cols-[2fr_3fr]">
        {/* Brand panel (large screens) */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-ink-900 via-ink-900 to-brand-700 p-10 text-white lg:flex">
          <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
          <div aria-hidden className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-bold">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">T</span>
              TechNova
            </Link>
            <h2 className="mt-12 text-3xl font-bold leading-tight">Electronics you can trust, delivered across Sri Lanka.</h2>
            <ul className="mt-9 space-y-6">
              {benefits.map(({ icon: Icon, title: t, text }) => (
                <li key={t} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-semibold">{t}</span>
                    <span className="mt-0.5 block text-sm text-white/70">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="relative mt-10 flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck className="h-4 w-4" aria-hidden /> Passwords are hashed. Your details are never shared.
          </p>
        </aside>

        {/* Form */}
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-brand-600"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back to store
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 lg:hidden">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Secure
            </span>
          </div>

          <h1 className="mt-8 text-3xl font-bold tracking-tight text-ink-900">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] text-slate-500">{subtitle}</p>}

          {notice && (
            <div role="status" className="mt-5 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-ink-700">
              {notice}
            </div>
          )}

          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
