type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
};

export default function Modal({ open, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <h2 className="text-xl font-bold text-brand-900">{title}</h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
