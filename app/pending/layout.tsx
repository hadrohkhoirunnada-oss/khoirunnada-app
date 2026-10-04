import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PendingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!isSupabaseConfigured()) redirect('/login?error=config');

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('status,is_member,is_admin,is_treasurer')
    .eq('auth_user_id', userId)
    .single();

  if (!profile) redirect('/login?error=profile_failed');
  if (profile.status === 'active') {
    if ((profile.is_admin || profile.is_treasurer) && !profile.is_member) {
      redirect('/app/admin');
    }
    redirect('/app');
  }

  return children;
}
