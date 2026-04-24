export default function Footer() {
  return (
    <footer className="bg-brand-50 py-10 mt-12 border-t border-brand-100">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center md:justify-between gap-4">
        <div className="font-semibold text-brand-900">&copy; {new Date().getFullYear()} MAI Natural</div>
        <div className="text-center text-slate-500 text-sm">
          <p>Cosmetica natural premium</p>
          <p>Entregas estimadas de 5 a 7 dias habiles por produccion artesanal y personalizada.</p>
        </div>
        <a href="mailto:info@mainatural.com" className="text-slate-500 text-sm underline">info@mainatural.com</a>
      </div>
    </footer>
  );
}
