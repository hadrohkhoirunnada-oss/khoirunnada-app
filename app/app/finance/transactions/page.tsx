'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export default function FinanceTransactionsRedirect() {
  const router = useRouter();
  const { currentUser } = useAppStore();

  useEffect(() => {
    if (currentUser.is_admin || currentUser.is_treasurer) {
      router.replace('/app/admin/finance');
    } else {
      router.replace('/app/finance');
    }
  }, [currentUser, router]);

  return (
    <div className="min-h-screen bg-[#070908] flex items-center justify-center text-xs text-[#D4A346]">
      Mengarahkan ke Pembukuan Kas...
    </div>
  );
}