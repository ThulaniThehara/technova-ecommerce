import Link from "next/link";
import { btnPrimary } from "@/lib/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-28 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-brand-600">404</p>
      <h1 className="mt-3 text-3xl font-bold text-ink-900 sm:text-4xl">Page not found</h1>
      <p className="mt-3 text-slate-600">
        The page or product you are looking for does not exist or is no longer available.
      </p>
      <Link href="/products" className={`${btnPrimary} mt-7 px-8 py-3.5 text-base`}>
        Back to products
      </Link>
    </div>
  );
}
