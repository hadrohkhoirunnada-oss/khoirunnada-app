import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function AdminOnlyLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('status,is_admin,is_treasurer')
    .eq('auth_user_id', userId)
    .single();

  if (!profile || profile.status !== 'active') redirect('/login');
  if (!profile.is_admin) {
    redirect(profile.is_treasurer ? '/app/admin/finance' : '/app');
  }

  return children;
}
