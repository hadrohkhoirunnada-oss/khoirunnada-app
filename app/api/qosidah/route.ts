import { NextResponse } from 'next/server';
import { QOSIDAH_LIST, QOSIDAH_CATEGORIES } from '@/lib/data/qosidah';

export const runtime = 'nodejs';

// GET: Ambil seluruh daftar qosidah & kategori langsung dari kode
export async function GET() {
  return NextResponse.json({
    qosidahs: QOSIDAH_LIST,
    categories: QOSIDAH_CATEGORIES,
    isStatic: true,
  });
}
