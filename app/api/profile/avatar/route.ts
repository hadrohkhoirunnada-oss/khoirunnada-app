import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const DEFAULT_AVATAR = '/logo-khoirunnada-192.png';

export async function POST(request: Request) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requestedId = formData.get('id') as string | null;

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

    // 0. Ambil profil saat ini dari tabel public.profiles untuk mendapatkan foto lama
    let { data: currentProfile } = await admin
      .from('profiles')
      .select('id, auth_user_id, email, avatar_url')
      .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (!currentProfile && requestedId) {
      const { data } = await admin
        .from('profiles')
        .select('id, auth_user_id, email, avatar_url')
        .eq('id', requestedId)
        .maybeSingle();
      currentProfile = data;
    }

    // 1. Hapus file avatar lama dari Supabase Storage (sehingga tidak ada file sampah menumpuk)
    try {
      // a. Hapus path file spesifik jika sebelumnya tersimpan di bucket avatars
      if (currentProfile?.avatar_url && currentProfile.avatar_url.includes('/avatars/')) {
        const parts = currentProfile.avatar_url.split('/avatars/');
        if (parts[1]) {
          const oldPath = decodeURIComponent(parts[1].split('?')[0]);
          await admin.storage.from('avatars').remove([oldPath]);
        }
      }

      // b. Hapus semua file lama yang berada di folder user.id
      const { data: userFiles } = await admin.storage.from('avatars').list(user.id);
      if (userFiles && userFiles.length > 0) {
        const toDelete = userFiles.map((f) => `${user.id}/${f.name}`);
        await admin.storage.from('avatars').remove(toDelete);
      }

      // c. Jika profile.id berbeda dari user.id, bersihkan juga foldernya
      if (currentProfile?.id && currentProfile.id !== user.id) {
        const { data: profileFiles } = await admin.storage.from('avatars').list(currentProfile.id);
        if (profileFiles && profileFiles.length > 0) {
          const toDelete = profileFiles.map((f) => `${currentProfile.id}/${f.name}`);
          await admin.storage.from('avatars').remove(toDelete);
        }
      }
    } catch (cleanupErr) {
      console.warn('Pembersihan file avatar lama:', cleanupErr);
    }

    // 2. Unggah file baru ke Supabase Storage
    const { error: uploadError } = await admin.storage.from('avatars').upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
      cacheControl: '3600',
    });

    if (uploadError) {
      console.error('Upload avatar storage error:', uploadError);
      return NextResponse.json(
        { error: 'Gagal mengunggah foto ke penyimpanan: ' + uploadError.message },
        { status: 500 }
      );
    }

    // 3. Dapatkan Public URL
    const { data: publicUrlData } = admin.storage.from('avatars').getPublicUrl(fileName);
    const publicUrl = publicUrlData.publicUrl;

    // 4. Update tabel public.profiles (tersimpan langsung dan terhubung ke Database)
    const targetProfileId = currentProfile?.id;
    const updateQuery = admin.from('profiles').update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    });

    const { error: profileError } = targetProfileId
      ? await updateQuery.eq('id', targetProfileId)
      : await updateQuery.eq('auth_user_id', user.id);

    if (profileError) {
      console.error('Update profile avatar error:', profileError);
      return NextResponse.json(
        { error: 'Gagal memperbarui profil di database.' },
        { status: 500 }
      );
    }

    // 5. Update auth user metadata
    await admin.auth.admin
      .updateUserById(user.id, {
        user_metadata: {
          ...(user.user_metadata || {}),
          avatar_url: publicUrl,
          picture: publicUrl,
        },
      })
      .catch((e) => console.warn('Update user metadata avatar warning:', e));

    return NextResponse.json({
      success: true,
      avatarUrl: publicUrl,
      message: 'Foto profil berhasil diperbarui di database dan foto lama telah dihapus.',
    });
  } catch (error) {
    console.error('POST /api/profile/avatar error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat mengunggah foto profil.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const url = new URL(request.url);
    const requestedId = url.searchParams.get('id');
    const admin = createAdminClient();

    // 0. Ambil profil saat ini
    let { data: currentProfile } = await admin
      .from('profiles')
      .select('id, auth_user_id, email, avatar_url')
      .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (!currentProfile && requestedId) {
      const { data } = await admin
        .from('profiles')
        .select('id, auth_user_id, email, avatar_url')
        .eq('id', requestedId)
        .maybeSingle();
      currentProfile = data;
    }

    // 1. Hapus semua file foto lama di storage
    try {
      if (currentProfile?.avatar_url && currentProfile.avatar_url.includes('/avatars/')) {
        const parts = currentProfile.avatar_url.split('/avatars/');
        if (parts[1]) {
          const oldPath = decodeURIComponent(parts[1].split('?')[0]);
          await admin.storage.from('avatars').remove([oldPath]);
        }
      }

      const { data: userFiles } = await admin.storage.from('avatars').list(user.id);
      if (userFiles && userFiles.length > 0) {
        const toDelete = userFiles.map((f) => `${user.id}/${f.name}`);
        await admin.storage.from('avatars').remove(toDelete);
      }

      if (currentProfile?.id && currentProfile.id !== user.id) {
        const { data: profileFiles } = await admin.storage.from('avatars').list(currentProfile.id);
        if (profileFiles && profileFiles.length > 0) {
          const toDelete = profileFiles.map((f) => `${currentProfile.id}/${f.name}`);
          await admin.storage.from('avatars').remove(toDelete);
        }
      }
    } catch (e) {
      console.warn('Storage cleanup error:', e);
    }

    // 2. Kembalikan URL di tabel profiles ke default logo
    const targetProfileId = currentProfile?.id;
    const updateQuery = admin.from('profiles').update({
      avatar_url: DEFAULT_AVATAR,
      updated_at: new Date().toISOString(),
    });

    if (targetProfileId) {
      await updateQuery.eq('id', targetProfileId);
    } else {
      await updateQuery.eq('auth_user_id', user.id);
    }

    // 3. Kembalikan user_metadata
    await admin.auth.admin
      .updateUserById(user.id, {
        user_metadata: {
          ...(user.user_metadata || {}),
          avatar_url: DEFAULT_AVATAR,
          picture: DEFAULT_AVATAR,
        },
      })
      .catch(() => {});

    return NextResponse.json({
      success: true,
      avatarUrl: DEFAULT_AVATAR,
      message: 'Foto profil telah dihapus dari database dan dikembalikan ke logo default.',
    });
  } catch (error) {
    console.error('DELETE /api/profile/avatar error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat menghapus foto profil.' },
      { status: 500 }
    );
  }
}
