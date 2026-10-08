import ProfileForm from "@/components/account/ProfileForm";
import { getCustomer } from "@/lib/auth";
import { card } from "@/lib/ui";

export default async function ProfilePage() {
  const customer = (await getCustomer())!;
  return (
    <section className={`${card} max-w-xl p-6 sm:p-8`}>
      <h2 className="text-lg font-bold text-ink-900">Profile</h2>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Your details are used to prefill checkout. You can still change them for each order.
      </p>
      <ProfileForm name={customer.name} email={customer.email} phone={customer.phone ?? ""} />
    </section>
  );
}
