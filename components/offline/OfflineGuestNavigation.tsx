'use client';

import { BookOpen, Calendar, Shield, User, Wallet } from 'lucide-react';

const items = [
  { id: 'qosidah', label: 'Qosidah', icon: BookOpen },
  { id: 'jobs', label: 'Jadwal', icon: Calendar },
  { id: 'finance', label: 'Keuangan', icon: Wallet },
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'admin', label: 'Admin', icon: Shield },
] as const;

export type OfflineSection = typeof items[number]['id'];

export function OfflineGuestNavigation({ active, onSelect }: { active: OfflineSection; onSelect: (section: OfflineSection) => void }) {
  return (
    <nav aria-label="Navigasi mode offline" className="pointer-events-none absolute bottom-0 left-0 right-0 z-40 px-4 pb-3 pt-2">
      <div className="pointer-events-auto flex items-center justify-around rounded-2xl border border-[#996A19]/20 bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur-2xl">
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => onSelect(id)} className={`flex min-h-11 min-w-14 flex-col items-center justify-center rounded-xl px-1 text-[10px] ${active === id ? 'bg-[#996A19]/12 font-bold text-[#996A19]' : 'text-[#585145]'}`}>
            <Icon className="mb-0.5 h-5 w-5" />{label}
          </button>
        ))}
      </div>
    </nav>
  );
}
