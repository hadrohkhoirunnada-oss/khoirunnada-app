import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Sesi login telah berakhir.' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('status, is_admin, is_treasurer')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Verify finance category profile error:', profileError);
      return NextResponse.json({ error: 'Gagal memverifikasi akses pengurus.' }, { status: 500 });
    }

    if (!profile || profile.status !== 'active' || (!profile.is_admin && !profile.is_treasurer)) {
      return NextResponse.json({ error: 'Akses hanya untuk Admin atau Bendahara aktif.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (body?.name !== 'Gaji Personel' || body?.type !== 'expense') {
      return NextResponse.json({ error: 'Kategori transaksi tidak valid.' }, { status: 400 });
    }

    const { data: category, error: upsertError } = await admin
      .from('finance_categories')
      .upsert({ name: 'Gaji Personel', type: 'expense', is_active: true }, { onConflict: 'name,type' })
      .select('*')
      .single();

    if (upsertError || !category) {
      console.error('Upsert finance category error:', upsertError);
      return NextResponse.json({ error: 'Kategori Gaji Personel gagal disiapkan.' }, { status: 500 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('POST /api/finance/categories error:', error);
    return NextResponse.json({ error: 'Gagal menyiapkan kategori transaksi.' }, { status: 500 });
  }
}
