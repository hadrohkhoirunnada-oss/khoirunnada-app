import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Sesi login telah berakhir. Silakan login kembali.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'File foto profil tidak ditemukan.' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Gunakan file JPG, PNG, atau WebP.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Ukuran foto maksimal adalah 5 MB.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let ext = 'jpg';
    if (file.type === 'image/png') ext = 'png';
    else if (file.type === 'image/webp') ext = 'webp';
    else if (file.type === 'image/gif') ext = 'gif';

    const fileName = `${user.id}/avatar-${Date.now()}.${ext}`;
    const admin = createAdminClient();

    // 1. Bersihkan file avatar lama milik user ini dari bucket avatars
    try {
      const { data: existingFiles } = await admin.storage.from('avatars').list(user.id);
      if (existingFiles && existingFiles.length > 0) {
        const toDelete = existingFiles.map((f) => `${user.id}/${f.name}`);
        await admin.storage.from('avatars').remove(toDelete);
      }
    } catch (cleanupErr) {
      console.warn('Gagal membersihkan avatar lama:', cleanupErr);
    }

    // 2. Unggah file baru ke Supabase Storage
    const { error: uploadError } = await admin.storage.from('avatars').upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
      cacheControl: '3600',
    });

    if (uploadError) {
      console.error('Upload avatar storage error:', uploadError);
      return NextResponse.json({ error: 'Gagal mengunggah foto ke penyimpanan: ' + uploadError.message }, { status: 500 });
    }

    // 3. Dapatkan Public URL
    const { data: publicUrlData } = admin.storage.from('avatars').getPublicUrl(fileName);
    const publicUrl = publicUrlData.publicUrl;

    // 4. Update tabel public.profiles
    const { error: profileError } = await admin
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('auth_user_id', user.id);

    if (profileError) {
      console.error('Update profile avatar error:', profileError);
      return NextResponse.json({ error: 'Gagal memperbarui profil di database.' }, { status: 500 });
    }

    // 5. Update auth user metadata
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...(user.user_metadata || {}),
        avatar_url: publicUrl,
        picture: publicUrl,
      },
    }).catch((e) => console.warn('Update user metadata avatar warning:', e));

    return NextResponse.json({
      success: true,
      avatarUrl: publicUrl,
      message: 'Foto profil berhasil diperbarui.',
    });
  } catch (error) {
    console.error('POST /api/profile/avatar error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem saat mengunggah foto profil.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Sesi login telah berakhir. Silakan login kembali.' }, { status: 401 });
    }

    const admin = createAdminClient();
    const defaultUrl = '/logo-khoirunnada-192.png';

    // 1. Hapus file-file di storage
    try {
      const { data: existingFiles } = await admin.storage.from('avatars').list(user.id);
      if (existingFiles && existingFiles.length > 0) {
        const toDelete = existingFiles.map((f) => `${user.id}/${f.name}`);
        await admin.storage.from('avatars').remove(toDelete);
      }
    } catch (e) {
      console.warn('Storage cleanup error:', e);
    }

    // 2. Kembalikan URL di tabel profiles ke default
    await admin
      .from('profiles')
      .update({
        avatar_url: defaultUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('auth_user_id', user.id);

    // 3. Kembalikan user_metadata
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...(user.user_metadata || {}),
        avatar_url: defaultUrl,
        picture: defaultUrl,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      avatarUrl: defaultUrl,
      message: 'Foto profil telah dikembalikan ke logo default.',
    });
  } catch (error) {
    console.error('DELETE /api/profile/avatar error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem saat menghapus foto profil.' }, { status: 500 });
  }
}
