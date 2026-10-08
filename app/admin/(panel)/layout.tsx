import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { getAdmin } from "@/lib/auth";

// Wraps every admin page except the login page (which lives outside this route group).
// This is the page-level second gate: proxy.ts redirects first, and this re-verifies the
// session against the database before anything admin is rendered.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-surface">
      <AdminHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
