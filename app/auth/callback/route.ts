import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function loginError(request: Request, code: string) {
  const url = new URL('/', request.url);
  url.searchParams.set('error', code);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const portal = searchParams.get('portal') === 'admin' ? 'admin' : 'pemain';

  if (!code) return loginError(request, 'oauth_failed');

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return loginError(request, 'oauth_failed');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return loginError(request, 'session_failed');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) return loginError(request, 'profile_failed');

  // 1. Jika akun masih berstatus pending, arahkan ke halaman persetujuan
  if (profile.status === 'pending') {
    return NextResponse.redirect(new URL('/pending', request.url));
  }

  // 2. Jika akun tidak aktif
  if (profile.status !== 'active') {
    await supabase.auth.signOut();
    return loginError(request, 'account_inactive');
  }

  // 3. Jika login pada tab Admin & Kas:
  if (portal === 'admin') {
    if (!profile.is_admin && !profile.is_treasurer) {
      await supabase.auth.signOut();
      return loginError(request, 'not_admin');
    }
    return NextResponse.redirect(
      new URL(profile.is_admin ? '/app/admin' : '/app/admin/finance', request.url)
    );
  }

  // 4. Jika login pada tab Pemain:
  // Baik pemain resmi maupun admin dapat langsung masuk ke portal pemain (/app)!
  return NextResponse.redirect(new URL('/app', request.url));
}
