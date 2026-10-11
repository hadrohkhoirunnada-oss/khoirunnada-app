import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured, getPublicSupabaseConfig } from './config';

export async function updateSession(request: NextRequest, pathname: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-khoirunnada-pathname', pathname);
  let response = NextResponse.next({ request: { headers: requestHeaders } });

  if (!isSupabaseConfigured()) return response;

  const { url, publishableKey } = getPublicSupabaseConfig();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) requestHeaders.set('cookie', cookieHeader);
        else requestHeaders.delete('cookie');
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // getClaims memverifikasi token, sekaligus memperbarui cookie yang kedaluwarsa.
  await supabase.auth.getClaims();
  return response;
}
