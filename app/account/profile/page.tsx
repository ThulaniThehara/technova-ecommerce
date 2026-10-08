import { ShieldCheck } from "lucide-react";
import ProfileForm from "@/components/account/ProfileForm";
import { getCustomer } from "@/lib/auth";
import { card } from "@/lib/ui";

export default async function ProfilePage() {
  const customer = (await getCustomer())!;
  const initials = customer.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

  return (
    <div className="max-w-3xl space-y-6">
      <section className={`${card} flex items-center gap-4 p-5 sm:gap-5 sm:p-6`}>
        <span
          aria-hidden
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white sm:h-16 sm:w-16 sm:text-xl"
        >
          {initials || "?"}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-ink-900">{customer.name}</h2>
          <p className="truncate text-sm text-slate-500">{customer.email}</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Customer account
          </span>
        </div>
      </section>

      <section className={`${card} p-5 sm:p-8`}>
        <h3 className="text-lg font-bold text-ink-900">Personal information</h3>
        <p className="mb-6 mt-1 text-sm text-slate-500">
          These details prefill your checkout. You can still change them for each order, and past orders keep the details
          they were placed with.
        </p>
        <ProfileForm name={customer.name} email={customer.email} phone={customer.phone ?? ""} />
      </section>
    </div>
  );
}
