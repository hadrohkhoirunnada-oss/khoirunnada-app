import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('status,is_admin,is_treasurer')
    .eq('auth_user_id', userId)
    .single();

  if (
    !profile ||
    profile.status !== 'active' ||
    (!profile.is_admin && !profile.is_treasurer)
  ) {
    redirect('/app');
  }

  return children;
}
