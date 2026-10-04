import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

// 1. GET: Ambil daftar anggota Hadroh Khoirunnada
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch members error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profiles: profiles || [] });
  } catch (error) {
    console.error('GET /api/members error:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar anggota.' }, { status: 500 });
  }
}

// 2. PATCH: Kelola Anggota & Peran (Approve, Role Toggle, Role Title, Deactivate)
export async function PATCH(request: Request) {
  try {
    const payload = await request.json();
    const { id, updates } = payload as {
      id: string;
      updates: Record<string, unknown>;
    };

    if (!id || !updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'ID anggota dan data pembaruan wajib diisi.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      console.error('Update member error:', error);
      return NextResponse.json({ error: error?.message || 'Gagal memperbarui profil anggota.' }, { status: 500 });
    }

    return NextResponse.json({ profile: data, success: true });
  } catch (error) {
    console.error('PATCH /api/members error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui peran anggota.' }, { status: 500 });
  }
}
