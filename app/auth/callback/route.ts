import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function loginError(request: Request, code: string) {
  const url = new URL('/login', request.url);
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

  if (profile.status === 'pending') {
    return NextResponse.redirect(new URL('/pending', request.url));
  }

  if (profile.status !== 'active') {
    await supabase.auth.signOut();
    return loginError(request, 'account_inactive');
  }

  if (portal === 'admin') {
    if (!profile.is_admin && !profile.is_treasurer) {
      await supabase.auth.signOut();
      return loginError(request, 'not_admin');
    }
    return NextResponse.redirect(
      new URL(profile.is_admin ? '/app/admin' : '/app/admin/finance', request.url)
    );
  }

  if ((profile.is_admin || profile.is_treasurer) && !profile.is_member) {
    await supabase.auth.signOut();
    return loginError(request, 'admin_portal_required');
  }

  if (!profile.is_member) {
    await supabase.auth.signOut();
    return loginError(request, 'not_member');
  }

  return NextResponse.redirect(new URL('/app', request.url));
}
