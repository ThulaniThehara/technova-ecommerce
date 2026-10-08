"use client";

import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { btnOutline } from "@/lib/ui";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("logout failed");
      router.replace("/admin/login");
      router.refresh();
    } catch {
      toast.error("Could not sign out. Please try again.");
      setPending(false);
    }
  }

  return (
    <button type="button" onClick={logout} disabled={pending} className={`${btnOutline} py-2.5`}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="h-4 w-4" aria-hidden />}
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}
