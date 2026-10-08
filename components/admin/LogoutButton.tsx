"use client";

import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200/80 bg-red-50/70 px-3.5 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-100/80 hover:text-red-700 focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin text-red-600" aria-hidden />
      ) : (
        <LogOut className="h-4 w-4 text-red-600" aria-hidden />
      )}
      <span>{pending ? "Signing out..." : "Sign out"}</span>
    </button>
  );
}
