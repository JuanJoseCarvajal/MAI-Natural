import "./admin.css";
import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false }, alternates: { canonical: null } };
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-access";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (role !== "admin") {
    redirect("/account");
  }

  try { await requireAdmin(); } catch { redirect("/login?callbackUrl=/admin"); }
  return <AdminShell>{children}</AdminShell>;
}
