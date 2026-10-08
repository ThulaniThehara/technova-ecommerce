import type { Metadata } from "next";
import AdminAuthShell from "@/components/admin/AdminAuthShell";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <AdminAuthShell title="Admin Login" subtitle="Sign in to manage products, inventory and orders.">
      <LoginForm />
    </AdminAuthShell>
  );
}
