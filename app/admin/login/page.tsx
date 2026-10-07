import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import Logo from "@/components/layout/Logo";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-[calc(100vh-0px)] lg:grid-cols-2">
      {/* Brand panel - hidden on small screens where the form needs the room. */}
      <div className="hidden flex-col justify-between bg-ink-900 p-12 lg:flex">
        <Logo href="/" onDark />
        <div>
          <h2 className="max-w-sm text-4xl font-bold leading-tight text-white">Run your store from one place.</h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-slate-400">
            Products, inventory and orders in a single admin panel.
          </p>
        </div>
        <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} TechNova</p>
      </div>

      <div className="flex items-center justify-center bg-white px-6 py-16">
        <LoginForm />
      </div>
    </div>
  );
}
