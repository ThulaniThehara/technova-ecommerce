import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import CustomerAuthForm from "@/components/auth/CustomerAuthForm";
import { getCustomer } from "@/lib/auth";
import { safeRedirect } from "@/lib/redirect";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create account", robots: { index: false, follow: false } };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const redirectTo = safeRedirect((await searchParams).redirect);
  if (await getCustomer()) redirect(redirectTo);

  const fromCheckout = redirectTo.startsWith("/checkout");
  return (
    <AuthShell
      mode="signup"
      title="Create your account"
      subtitle="Track your orders and check out faster."
      notice={
        fromCheckout ? (
          <p className="font-semibold">Create an account to continue to checkout. Your cart is saved.</p>
        ) : undefined
      }
    >
      <CustomerAuthForm mode="signup" redirectTo={redirectTo} />
    </AuthShell>
  );
}
