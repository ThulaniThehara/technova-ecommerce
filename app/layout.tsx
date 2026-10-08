import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import AuthModalProvider from "@/components/auth/AuthModal";
import CartSync from "@/components/cart/CartSync";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { getCustomerDisplay } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "TechNova | Electronics & Tech Gadgets", template: "%s | TechNova" },
  description: "Shop smartphones, laptops, smart devices and accessories. Pay online with PayHere or order via WhatsApp.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Display-only (token check, no database): lets the navbar show "Sign in" or the account menu.
  const customer = await getCustomerDisplay().catch(() => null);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* Navbar and Footer render nothing on /admin routes - the admin panel has its own shell. */}
        {/* While signed in, the cart is kept in step with the server so it follows the customer between devices. */}
        {customer && <CartSync userId={customer.id} />}
        <AuthModalProvider signedIn={!!customer}>
          <Navbar customer={customer} />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthModalProvider>
        <Toaster position="top-center" richColors toastOptions={{ className: "rounded-xl" }} />
      </body>
    </html>
  );
}
