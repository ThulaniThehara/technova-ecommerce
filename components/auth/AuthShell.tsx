import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { LoginIllustration, SignupIllustration } from "./AuthIllustrations";

/**
 * Shared frame for customer login and sign-up pages matching the modern illustrated card design.
 */
export default function AuthShell({
  mode = "login",
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
  const isLogin = mode === "login";

  return (
    <div className="relative flex min-h-[calc(100vh-140px)] items-center justify-center overflow-hidden px-4 py-8 sm:py-12 lg:py-16">
      {/* Soft ambient background aura */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-100/60 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 right-10 -z-10 h-80 w-80 rounded-full bg-cyan-100/50 blur-[100px]"
      />

      {/* Main illustrated auth card */}
      <div className="relative w-full max-w-lg sm:max-w-xl lg:max-w-2xl rounded-[32px] border border-line/90 bg-white p-6 shadow-[0_24px_60px_-20px_rgba(13,26,47,0.12)] sm:p-10 lg:p-12">
        {/* Back navigation button */}
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/"
            aria-label="Back to home"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-surface hover:text-ink-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="text-xs font-medium text-slate-400">TechNova Secure</span>
        </div>

        {/* Top Illustration */}
        <div className="my-3 flex items-center justify-center">
          {isLogin ? (
            <LoginIllustration className="h-44 sm:h-52 w-full max-w-[340px]" />
          ) : (
            <SignupIllustration className="h-44 sm:h-52 w-full max-w-[340px]" />
          )}
        </div>

        {/* Title */}
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 sm:text-[26px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}

        {/* Notice/Alert if redirected from checkout */}
        {notice && (
          <div role="status" className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-3.5 text-xs text-ink-700">
            {notice}
          </div>
        )}

        {/* Form Body */}
        <div className="mt-5">{children}</div>

        {/* Security badge */}
        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" aria-hidden /> Stored securely with end-to-end encryption.
        </p>
      </div>
    </div>
  );
}
