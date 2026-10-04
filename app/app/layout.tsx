import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ProtectedAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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

  return children;
}
