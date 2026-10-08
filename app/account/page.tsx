import { CheckCircle2, Clock, ShoppingBag } from "lucide-react";
import Link from "next/link";
import ProfileForm from "@/components/account/ProfileForm";
import { getCustomerSummary } from "@/lib/account";
import { getCustomer } from "@/lib/auth";
import { card } from "@/lib/ui";

export default async function AccountPage() {
  const customer = (await getCustomer())!; // the layout already redirected anyone who is not signed in
  const summary = await getCustomerSummary(customer.id);

  const cards = [
    { label: "Total orders", value: summary.total, icon: ShoppingBag, href: "/account/orders" },
    { label: "In progress", value: summary.pending, icon: Clock, href: "/account/orders" },
    { label: "Completed", value: summary.completed, icon: CheckCircle2, href: "/account/orders?status=COMPLETED" },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className={`${card} p-6 transition hover:border-brand-200`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="mt-4 text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-ink-900">{value}</p>
          </Link>
        ))}
      </div>

      <section className={`${card} mt-8 max-w-xl p-6 sm:p-8`}>
        <h2 className="text-lg font-bold text-ink-900">Profile</h2>
        <p className="mb-6 mt-1 text-sm text-slate-500">
          Your details are used to prefill checkout. You can still change them for each order.
        </p>
        <ProfileForm name={customer.name} email={customer.email} phone={customer.phone ?? ""} />
      </section>
    </>
  );
}
