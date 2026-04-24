import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { auth } from "@/lib/auth";

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

  return <AdminShell>{children}</AdminShell>;
}
