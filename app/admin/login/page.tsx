import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <LoginForm />
    </div>
  );
}
