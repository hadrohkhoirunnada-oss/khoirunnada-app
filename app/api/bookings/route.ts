import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { bookingSchema } from '@/lib/validation/booking';

export const runtime = 'nodejs';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const attempts = new Map<string, number[]>();

function getClientAddress(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((value) => now - value < WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > MAX_REQUESTS;
}

export async function POST(request: Request) {
  const address = getClientAddress(request);
  if (isRateLimited(address)) {
    return NextResponse.json(
      { error: 'Terlalu banyak percobaan. Silakan tunggu beberapa menit.' },
      { status: 429 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Format permintaan tidak valid.' }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Data booking belum lengkap atau tidak valid.' },
      { status: 400 }
    );
  }

  if (parsed.data.event_date < new Date().toISOString().slice(0, 10)) {
    return NextResponse.json(
      { error: 'Tanggal acara tidak boleh berada di masa lalu.' },
      { status: 400 }
    );
  }

  const { website: _honeypot, ...booking } = parsed.data;
  const fingerprint = createHash('sha256')
    .update(
      [
        booking.customer_phone.replace(/\D/g, ''),
        booking.event_date,
        booking.event_time.toLowerCase(),
        booking.location.toLowerCase(),
      ].join('|')
    )
    .digest('hex');

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...booking,
        event_name: booking.event_name || null,
        location_detail: booking.location_detail || null,
        notes: booking.notes || null,
        request_fingerprint: fingerprint,
      })
      .select('*')
      .single();

    if (error?.code === '23505') {
      const { data: existing } = await supabase
        .from('bookings')
        .select('*')
        .eq('request_fingerprint', fingerprint)
        .single();

      if (existing) return NextResponse.json({ booking: existing, duplicate: true });
    }

    if (error || !data) {
      console.error('Booking insert failed:', error?.code, error?.message);
      return NextResponse.json(
        { error: 'Booking belum dapat disimpan. Silakan coba kembali.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ booking: data }, { status: 201 });
  } catch (error) {
    console.error('Booking endpoint configuration error:', error);
    return NextResponse.json(
      { error: 'Layanan booking belum dikonfigurasi oleh pengurus.' },
      { status: 503 }
    );
  }
}
