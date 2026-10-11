import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { AppOfflineRouteGate } from '@/components/offline/AppOfflineRouteGate';
import { OfflineGuestServerGate } from '@/components/offline/OfflineGuestServerGate';

export const dynamic = 'force-dynamic';

export default async function ProtectedAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = (await headers()).get('x-khoirunnada-pathname') ?? '';
  const isQosidah = pathname === '/app/qosidah' || pathname.startsWith('/app/qosidah/');

  // Lirik qosidah berasal dari kode lokal dan aman dibuka tanpa sesi akun.
  if (isQosidah) return <AppOfflineRouteGate>{children}</AppOfflineRouteGate>;

  if ((await cookies()).get('khoirunnada_offline_guest')?.value === 'true') {
    return <OfflineGuestServerGate />;
  }

  if (!isSupabaseConfigured()) redirect('/login?error=config');

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('status,is_member,is_treasurer,is_admin')
    .eq('auth_user_id', userId)
    .single();

  if (!profile) redirect('/login?error=profile_failed');
  if (profile.status === 'pending') redirect('/pending');
  if (profile.status !== 'active') redirect('/login?error=account_inactive');

  if (!profile.is_member && !profile.is_treasurer && !profile.is_admin) {
    redirect('/pending');
  }

  return <AppOfflineRouteGate>{children}</AppOfflineRouteGate>;
}
