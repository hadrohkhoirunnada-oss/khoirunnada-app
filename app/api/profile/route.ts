import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

// PATCH: Memperbarui profil (Username / Nama Lengkap) pengguna saat ini di database
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Sesi login telah berakhir. Silakan login kembali.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawName = body?.name;

    if (!rawName || typeof rawName !== 'string' || !rawName.trim()) {
      return NextResponse.json(
        { error: 'Nama / username tidak boleh kosong.' },
        { status: 400 }
      );
    }

    const trimmedName = rawName.trim();
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: 'Nama / username minimal 2 karakter.' },
        { status: 400 }
      );
    }

    if (trimmedName.length > 60) {
      return NextResponse.json(
        { error: 'Nama / username maksimal 60 karakter.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 1. Cari profil di tabel public.profiles
    const { data: currentProfile } = await admin
      .from('profiles')
      .select('id, auth_user_id, email, name')
      .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    const targetProfileId = currentProfile?.id;
    const updateQuery = admin.from('profiles').update({
      name: trimmedName,
      updated_at: new Date().toISOString(),
    });

    const { data: updatedProfile, error: profileError } = targetProfileId
      ? await updateQuery.eq('id', targetProfileId).select('*').single()
      : await updateQuery.eq('auth_user_id', user.id).select('*').single();

    if (profileError) {
      console.error('Update profile error:', profileError);
      return NextResponse.json(
        { error: 'Gagal memperbarui username di database: ' + profileError.message },
        { status: 500 }
      );
    }

    // 2. Sinkronkan ke metadata akun Supabase Auth
    await admin.auth.admin
      .updateUserById(user.id, {
        user_metadata: {
          ...(user.user_metadata || {}),
          name: trimmedName,
          full_name: trimmedName,
        },
      })
      .catch((e) => console.warn('Update user metadata name warning:', e));

    return NextResponse.json({
      success: true,
      name: trimmedName,
      profile: updatedProfile,
      message: 'Username berhasil diperbarui di database.',
    });
  } catch (error) {
    console.error('PATCH /api/profile error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memperbarui username.' },
      { status: 500 }
    );
  }
}
