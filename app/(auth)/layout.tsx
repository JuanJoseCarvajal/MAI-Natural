import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false }, alternates: { canonical: null } };
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-180px)] grid place-items-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow ring-1 ring-brand-100">{children}</section>
    </div>
  );
}
