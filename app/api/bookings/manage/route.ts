import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { BookingStatus, Job } from '@/lib/types';

export const runtime = 'nodejs';

// 1. GET: Ambil daftar seluruh booking acara
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) {
      console.error('Fetch bookings error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookings: bookings || [] });
  } catch (error) {
    console.error('GET /api/bookings/manage error:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar booking.' }, { status: 500 });
  }
}

// 2. PATCH: Update Status Booking oleh Admin
export async function PATCH(request: Request) {
  try {
    const payload = await request.json();
    const { id, status, adminNotes } = payload as {
      id: string;
      status: BookingStatus;
      adminNotes?: string;
    };

    if (!id || !status) {
      return NextResponse.json({ error: 'ID booking dan status wajib diisi.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status,
        admin_notes: adminNotes !== undefined ? (adminNotes || null) : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      console.error('Update booking status error:', error);
      return NextResponse.json({ error: error?.message || 'Gagal memperbarui booking.' }, { status: 500 });
    }

    return NextResponse.json({ booking: data, success: true });
  } catch (error) {
    console.error('PATCH /api/bookings/manage error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui status booking.' }, { status: 500 });
  }
}

// 3. POST: Konversi Booking menjadi Job Resmi
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { bookingId, gatherTime, mapsUrl, dressCode, transportInfo, notes, createdBy } = payload as {
      bookingId: string;
      gatherTime?: string;
      mapsUrl?: string;
      dressCode?: string;
      transportInfo?: string;
      notes?: string;
      createdBy?: string;
    };

    if (!bookingId) {
      return NextResponse.json({ error: 'ID booking wajib disertakan.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Coba konversi via RPC convert_booking_to_job
    const { data: rpcJob, error: rpcErr } = await supabase.rpc('convert_booking_to_job', {
      booking_uuid: bookingId,
      gather_time_value: gatherTime || '18:30 WITA',
      maps_url_value: mapsUrl || null,
      dress_code_value: dressCode || 'Gamis Putih, Jas Hitam Khoirunnada',
      transport_info_value: transportInfo || 'Kumpul bersama di Markaz Khoirunnada',
      notes_value: notes || null,
    });

    if (!rpcErr && rpcJob) {
      return NextResponse.json({ job: rpcJob as unknown as Job, success: true });
    }

    // 2. Fallback manual jika RPC mengalami constraint:
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bErr || !booking) {
      return NextResponse.json({ error: 'Data booking tidak ditemukan.' }, { status: 404 });
    }

    // Insert ke tabel jobs
    const { data: newJob, error: jobErr } = await supabase
      .from('jobs')
      .insert({
        booking_id: booking.id,
        title: booking.event_name ? `${booking.event_type} - ${booking.event_name}` : `Acara ${booking.event_type}`,
        event_type: booking.event_type,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        event_date: booking.event_date,
        gather_time: gatherTime || '18:30 WITA',
        start_time: booking.event_time,
        location: booking.location,
        maps_url: mapsUrl || '',
        dress_code: dressCode || 'Gamis Putih, Jas Hitam Khoirunnada',
        transport_info: transportInfo || 'Kumpul bersama di Markaz Khoirunnada',
        notes: notes || booking.notes || null,
        status: 'upcoming',
        created_by: createdBy || '275bfc12-5751-400a-961c-67e206b8e5c2', // Admin Khoirunnada default
      })
      .select('*')
      .single();

    if (jobErr || !newJob) {
      console.error('Fallback job creation error:', jobErr);
      return NextResponse.json({ error: jobErr?.message || 'Gagal membuat job dari booking.' }, { status: 500 });
    }

    // Update booking status
    await supabase
      .from('bookings')
      .update({ status: 'confirmed', converted_job_id: newJob.id })
      .eq('id', bookingId);

    return NextResponse.json({ job: newJob as unknown as Job, success: true });
  } catch (error) {
    console.error('POST /api/bookings/manage error:', error);
    return NextResponse.json({ error: 'Gagal mengonversi booking ke job.' }, { status: 500 });
  }
}
