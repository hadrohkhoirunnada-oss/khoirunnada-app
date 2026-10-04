import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createAnonClient } from '@supabase/supabase-js';
import { getPublicSupabaseConfig } from '@/lib/supabase/config';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { email, password, portal } = payload as {
      email?: string;
      password?: string;
      portal?: 'pemain' | 'admin';
    };

    const normalizedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const selectedPortal = portal === 'admin' ? 'admin' : 'pemain';

    if (!normalizedEmail || !cleanPassword) {
      return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Format email tidak valid (contoh: nama@domain.com).' }, { status: 400 });
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { url, publishableKey } = getPublicSupabaseConfig();
    const anon = createAnonClient(url, publishableKey);

    // 1. Cek apakah user sudah terdaftar di Supabase Auth
    const { data: { users } } = await admin.auth.admin.listUsers();
    let authUser = users.find((u) => (u.email || '').toLowerCase() === normalizedEmail);

    // KASUS 1: Akun Belum Ada di Supabase Auth (Pendaftaran Baru Pemain)
    if (!authUser) {
      if (selectedPortal === 'admin') {
        return NextResponse.json(
          { error: 'Email ini belum terdaftar sebagai Admin atau Bendahara. Hubungi pengurus.' },
          { status: 403 }
        );
      }

      // Buat akun pemain baru di Supabase Auth dengan email_confirm: true
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: normalizedEmail,
        password: cleanPassword,
        email_confirm: true,
        user_metadata: {
          name: normalizedEmail.split('@')[0],
          avatar_url: '/logo-khoirunnada-192.png',
          has_password: true,
        },
      });

      if (createErr || !created.user) {
        return NextResponse.json({ error: createErr?.message || 'Gagal mendaftarkan akun baru.' }, { status: 500 });
      }

      authUser = created.user;

      // Pastikan profile tersimpan dengan status 'pending'
      const { data: existingProfile } = await admin
        .from('profiles')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .maybeSingle();

      if (!existingProfile) {
        await admin.from('profiles').insert({
          auth_user_id: authUser.id,
          name: normalizedEmail.split('@')[0],
          email: normalizedEmail,
          avatar_url: '/logo-khoirunnada-192.png',
          status: 'pending',
          is_member: false,
          is_treasurer: false,
          is_admin: false,
        });
      }

      // Lakukan login untuk membuat session
      const { data: newSession } = await anon.auth.signInWithPassword({
        email: normalizedEmail,
        password: cleanPassword,
      });

      return NextResponse.json({
        success: true,
        isNew: true,
        destination: '/pending',
        session: newSession?.session,
        message: 'Akun baru berhasil didaftarkan. Menunggu konfirmasi persetujuan pengurus.',
      });
    }

    // KASUS 2: Akun Sudah Ada
    let { data: signInData, error: signInErr } = await anon.auth.signInWithPassword({
      email: normalizedEmail,
      password: cleanPassword,
    });

    // Jika gagal login, cek apakah user awalnya hanya mendaftar lewat Google (belum memiliki password)
    if (signInErr) {
      const hasPasswordMeta = Boolean(authUser.user_metadata?.has_password);
      const isPureGoogle =
        authUser.app_metadata?.provider === 'google' ||
        (Array.isArray(authUser.app_metadata?.providers) &&
          authUser.app_metadata.providers.includes('google') &&
          !authUser.app_metadata.providers.includes('email'));

      if (!hasPasswordMeta && isPureGoogle) {
        // Izinkan akun Google mengatur password pertamanya agar bisa login lewat Password maupun Google
        const { error: updErr } = await admin.auth.admin.updateUserById(authUser.id, {
          password: cleanPassword,
          user_metadata: {
            ...(authUser.user_metadata || {}),
            has_password: true,
          },
        });

        if (!updErr) {
          const retry = await anon.auth.signInWithPassword({
            email: normalizedEmail,
            password: cleanPassword,
          });
          signInData = retry.data;
          signInErr = retry.error;
        }
      }
    }

    if (signInErr || !signInData?.user) {
      return NextResponse.json({ error: 'Email atau password yang Anda masukkan tidak sesuai.' }, { status: 401 });
    }

    // Update has_password metadata jika belum tercatat
    if (!authUser.user_metadata?.has_password) {
      await admin.auth.admin.updateUserById(authUser.id, {
        user_metadata: {
          ...(authUser.user_metadata || {}),
          has_password: true,
        },
      }).catch(() => {});
    }

    // Ambil profil akun dari database
    let { data: profile } = await admin
      .from('profiles')
      .select('*')
      .eq('auth_user_id', signInData.user.id)
      .maybeSingle();

    if (!profile) {
      // Jika profil belum ada (misal pendaftaran manual), sinkronkan dari auth
      const { data: createdProf } = await admin
        .from('profiles')
        .insert({
          auth_user_id: signInData.user.id,
          name: authUser.user_metadata?.name || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          avatar_url: authUser.user_metadata?.avatar_url || '/logo-khoirunnada-192.png',
          status: 'pending',
          is_member: false,
          is_treasurer: false,
          is_admin: false,
        })
        .select()
        .single();
      profile = createdProf;
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profil akun belum tersedia di database.' }, { status: 404 });
    }

    // 1. Jika masih pending -> arahkan ke halaman persetujuan (/pending)
    if (profile.status === 'pending') {
      return NextResponse.json({
        success: true,
        destination: '/pending',
        status: 'pending',
        session: signInData.session,
      });
    }

    // 2. Jika tidak aktif -> tolak
    if (profile.status !== 'active') {
      return NextResponse.json(
        { error: 'Akun ini sedang tidak aktif. Silakan hubungi Pengurus Hadroh Khoirunnada.' },
        { status: 403 }
      );
    }

    // 3. Jika sudah aktif, tentukan tujuan portal sesuai pilihan login:
    if (selectedPortal === 'admin') {
      if (!profile.is_admin && !profile.is_treasurer) {
        return NextResponse.json(
          { error: 'Akun ini tidak memiliki hak akses Admin atau Bendahara.' },
          { status: 403 }
        );
      }
      return NextResponse.json({
        success: true,
        destination: profile.is_admin ? '/app/admin' : '/app/admin/finance',
        session: signInData.session,
        profile,
      });
    }

    // Jika selectedPortal === 'pemain':
    // Baik pemain resmi maupun admin dapat langsung masuk ke /app!
    return NextResponse.json({
      success: true,
      destination: '/app',
      session: signInData.session,
      profile,
    });
  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem saat proses login.' }, { status: 500 });
  }
}
