import { MobileAppShell } from '@/components/layout/MobileAppShell';

export default function SejarahPage() {
  return (
    <MobileAppShell title="Sejarah" subtitle="Hadroh Khoirunnada" showBack backHref="/app">
      <section aria-labelledby="sejarah-title" className="pt-2">
        <h1 id="sejarah-title" className="text-2xl font-bold tracking-tight text-[#24231E]">
          Sejarah Hadroh Khoirunnada
        </h1>
        <div className="mt-4 h-0.5 w-12 rounded-full bg-[#996A19]" aria-hidden="true" />
        <p className="mt-6 text-sm leading-7 text-[#575348]">
          Developer sedang menyusun sejarah Hadroh Khoirunnada dengan saksama agar dapat disajikan secara lengkap dan sempurna. Informasinya akan ditampilkan di halaman ini setelah selesai.
        </p>
        <div className="mt-8 border-t border-[#E3DCD0] pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8C6821]">
            Pemberitahuan dari Developer
          </p>
          <p className="mt-1 text-sm font-bold text-[#24231E]">Dzarin</p>
        </div>
      </section>
    </MobileAppShell>
  );
}
