import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import CustomerAuthForm from "@/components/auth/CustomerAuthForm";
import { getCustomer } from "@/lib/auth";
import { safeRedirect } from "@/lib/redirect";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const redirectTo = safeRedirect((await searchParams).redirect);
  if (await getCustomer()) redirect(redirectTo); // already signed in

  const fromCheckout = redirectTo.startsWith("/checkout");
  return (
    <AuthShell
      mode="login"
      title="Login"
      notice={
        fromCheckout ? (
          <>
            <p className="font-semibold">Please sign in or create an account to continue to checkout.</p>
            <p className="mt-1 text-slate-600">
              You can browse and add products to your cart without an account, but you need to sign in before placing an
              order. Your cart is saved.
            </p>
          </>
        ) : undefined
      }
    >
      <CustomerAuthForm mode="login" redirectTo={redirectTo} />
    </AuthShell>
  );
}
