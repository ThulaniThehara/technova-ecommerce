import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** Simple centred card for the customer sign-in and sign-up pages. */
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
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to store
        </Link>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}

        {notice && (
          <div role="status" className="mt-5 rounded-xl border border-brand-200 bg-brand-50 p-3.5 text-sm text-ink-700">
            {notice}
          </div>
        )}

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
