import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 text-slate-600">The page or product you are looking for does not exist or is no longer available.</p>
      <Link href="/products" className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">
        Back to products
      </Link>
    </div>
  );
}
