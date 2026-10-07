"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { btnOutline } from "@/lib/ui";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={logout} className={`${btnOutline} py-2.5`}>
      <LogOut className="h-4 w-4" aria-hidden /> Sign out
    </button>
  );
}
