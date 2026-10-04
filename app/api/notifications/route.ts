import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { AppNotification } from '@/lib/types';

export const runtime = 'nodejs';

// 1. GET: Ambil daftar notifikasi untuk pengguna (baik Pemain maupun Admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Parameter userId wajib disertakan.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Ambil semua notifikasi pengguna dari user_notifications
    const { data: userNotifs, error: unError } = await supabase
      .from('user_notifications')
      .select('notification_id, is_read, read_at, created_at, notifications(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unError) {
      console.error('Fetch user_notifications error:', unError);
      return NextResponse.json({ error: unError.message }, { status: 500 });
    }

    // 2. Auto-heal: Ambil pengumuman aktif target_type='all' yang mungkin belum masuk ke user_notifications
    const { data: broadcastNotifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'announcement')
      .order('created_at', { ascending: false })
      .limit(10);

    const existingNotifIds = new Set((userNotifs || []).map((row) => row.notification_id));
    const missingBroadcasts = (broadcastNotifs || []).filter((b) => !existingNotifIds.has(b.id));

    if (missingBroadcasts.length > 0) {
      const healRows = missingBroadcasts.map((b) => ({
        notification_id: b.id,
        user_id: userId,
        is_read: false,
      }));
      await supabase.from('user_notifications').upsert(healRows, { onConflict: 'notification_id,user_id' });
    }

    // 3. Normalisasi hasil
    type RawRow = {
      notification_id: string;
      is_read: boolean;
      read_at?: string | null;
      created_at: string;
      notifications: Omit<AppNotification, 'is_read'> | Array<Omit<AppNotification, 'is_read'>> | null;
    };

    const notifMap = new Map<string, AppNotification>();

    (userNotifs as unknown as RawRow[] || []).forEach((row) => {
      const base = Array.isArray(row.notifications) ? row.notifications[0] : row.notifications;
      if (base && !notifMap.has(base.id)) {
        notifMap.set(base.id, {
          ...base,
          is_read: Boolean(row.is_read),
        });
      }
    });

    // Tambahkan missing broadcasts yang baru di-heal
    missingBroadcasts.forEach((b) => {
      if (!notifMap.has(b.id)) {
        notifMap.set(b.id, {
          ...b,
          is_read: false,
        });
      }
    });

    const notifications = Array.from(notifMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json({ error: 'Gagal mengambil notifikasi.' }, { status: 500 });
  }
}

// 2. POST: Siarkan Pengumuman ke SEMUA ANGGOTA (Pemain & Pengurus)
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { title, message, createdBy } = payload;

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Judul dan isi pengumuman wajib diisi.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Simpan ke tabel notifications dengan target_type = 'all' (Semua Anggota)
    const { data: notif, error: notifError } = await supabase
      .from('notifications')
      .insert({
        title: title.trim(),
        message: message.trim(),
        type: 'announcement',
        target_type: 'all',
        target_url: '/app',
        created_by: createdBy || null,
      })
      .select('*')
      .single();

    if (notifError || !notif) {
      console.error('Insert notification error:', notifError);
      return NextResponse.json({ error: notifError?.message || 'Gagal menyimpan pengumuman.' }, { status: 500 });
    }

    // 2. Fanout langsung ke seluruh profil aktif
    const { data: activeProfiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('status', 'active');

    if (activeProfiles && activeProfiles.length > 0) {
      const fanoutRows = activeProfiles.map((p) => ({
        notification_id: notif.id,
        user_id: p.id,
        is_read: false,
      }));

      await supabase
        .from('user_notifications')
        .upsert(fanoutRows, { onConflict: 'notification_id,user_id' });
    }

    return NextResponse.json({ notification: notif, success: true });
  } catch (error) {
    console.error('POST /api/notifications error:', error);
    return NextResponse.json({ error: 'Gagal menyiarkan pengumuman.' }, { status: 500 });
  }
}

// 3. PATCH: Tandai Notifikasi Sudah Dibaca (Optimistic & DB update)
export async function PATCH(request: Request) {
  try {
    const payload = await request.json();
    const { notificationId, markAll, userId } = payload;

    if (!userId) {
      return NextResponse.json({ error: 'userId wajib disertakan.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const nowIso = new Date().toISOString();

    if (markAll) {
      await supabase
        .from('user_notifications')
        .update({ is_read: true, read_at: nowIso })
        .eq('user_id', userId)
        .eq('is_read', false);
    } else if (notificationId) {
      await supabase
        .from('user_notifications')
        .update({ is_read: true, read_at: nowIso })
        .eq('user_id', userId)
        .eq('notification_id', notificationId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/notifications error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui status notifikasi.' }, { status: 500 });
  }
}
