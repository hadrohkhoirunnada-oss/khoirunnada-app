import { MobileAppShell } from '@/components/layout/MobileAppShell';

export default function AdminAiStudioPage() {
  return (
    <MobileAppShell
      title="Khoirunnada Ai Studio"
      showBack
      backHref="/app/admin"
    >
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-center text-base font-semibold text-[#585145]">
          Sedang Di Kerjakan
        </p>
      </div>
    </MobileAppShell>
  );
}
