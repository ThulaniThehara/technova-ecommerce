import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccountNav from "@/components/account/AccountNav";
import { getCustomer } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My account", robots: { index: false, follow: false } };

// Second gate (proxy.ts is the first) for every /account page.
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const customer = await getCustomer();
  if (!customer) redirect("/login?redirect=/account");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">My Account</h1>
      <p className="mt-1.5 text-[15px] text-slate-600">{customer.email}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
