export default function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-white p-5 shadow ring-1 ring-brand-100">{children}</div>;
}
