import { PackageSearch } from "lucide-react";
import Link from "next/link";
import { btnPrimary, card } from "@/lib/ui";

export default function OrderNotFound() {
  return (
    <div className={`${card} flex flex-col items-center px-6 py-16 text-center`}>
      <PackageSearch className="h-10 w-10 text-slate-300" aria-hidden />
      <h2 className="mt-4 text-lg font-bold text-ink-900">Order not found.</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">The order may not exist or you may not have permission to view it.</p>
      <Link href="/account/orders" className={`${btnPrimary} mt-6`}>
        Back to My Orders
      </Link>
    </div>
  );
}
