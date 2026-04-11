export default function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-900">{children}</span>;
}
