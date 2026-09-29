import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { getSession } from "@/lib/data";

// Recherche + upload de photos dans les Server Actions admin.
export const maxDuration = 60;

export const metadata: Metadata = { title: "Back-office", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getSession();
  if (!user) redirect("/connexion?next=/admin");
  if (profile?.role !== "ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <AdminNav />
      {children}
    </div>
  );
}
