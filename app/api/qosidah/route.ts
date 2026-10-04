import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Qosidah } from '@/lib/types';

export const runtime = 'nodejs';

// 1. GET: Ambil seluruh daftar qosidah & kategori
export async function GET() {
  try {
    const supabase = createAdminClient();
    const [categoriesResult, qosidahResult] = await Promise.all([
      supabase.from('qosidah_categories').select('*').order('sort_order'),
      supabase.from('qosidah').select('*').order('sort_order'),
    ]);

    if (categoriesResult.error) {
      console.error('Fetch categories error:', categoriesResult.error);
      return NextResponse.json({ error: categoriesResult.error.message }, { status: 500 });
    }

    if (qosidahResult.error) {
      console.error('Fetch qosidah error:', qosidahResult.error);
      return NextResponse.json({ error: qosidahResult.error.message }, { status: 500 });
    }

    const categoryNames = new Map((categoriesResult.data || []).map((c) => [c.id, c.name]));
    const qosidahs = (qosidahResult.data || []).map((item) => ({
      ...item,
      tags: item.tags || [],
      category_name: categoryNames.get(item.category_id) || 'Sholawat',
    }));

    return NextResponse.json({
      qosidahs,
      categories: categoriesResult.data || [],
    });
  } catch (error) {
    console.error('GET /api/qosidah error:', error);
    return NextResponse.json({ error: 'Gagal memuat bank lirik qosidah.' }, { status: 500 });
  }
}

// 2. POST: Tambah Qosidah Baru oleh Admin
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { category_name: _categoryName, ...databaseInput } = payload;

    if (!databaseInput.title?.trim() || !databaseInput.arabic_text?.trim() || !databaseInput.latin_text?.trim()) {
      return NextResponse.json({ error: 'Judul, teks Arab, dan teks Latin wajib diisi.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('qosidah')
      .insert({
        ...databaseInput,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('Insert qosidah error:', error);
      return NextResponse.json({ error: error?.message || 'Gagal menyimpan lirik qosidah.' }, { status: 500 });
    }

    return NextResponse.json({ qosidah: data, success: true });
  } catch (error) {
    console.error('POST /api/qosidah error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan lirik qosidah.' }, { status: 500 });
  }
}

// 3. PATCH: Update Qosidah oleh Admin
export async function PATCH(request: Request) {
  try {
    const payload = await request.json();
    const { id, category_name: _categoryName, created_at: _createdAt, ...updates } = payload;

    if (!id) {
      return NextResponse.json({ error: 'ID Qosidah wajib disertakan.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('qosidah')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      console.error('Update qosidah error:', error);
      return NextResponse.json({ error: error?.message || 'Gagal memperbarui qosidah.' }, { status: 500 });
    }

    return NextResponse.json({ qosidah: data, success: true });
  } catch (error) {
    console.error('PATCH /api/qosidah error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui qosidah.' }, { status: 500 });
  }
}

// 4. DELETE: Hapus Qosidah oleh Admin
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID Qosidah wajib disertakan.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('qosidah').delete().eq('id', id);

    if (error) {
      console.error('Delete qosidah error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/qosidah error:', error);
    return NextResponse.json({ error: 'Gagal menghapus qosidah.' }, { status: 500 });
  }
}
