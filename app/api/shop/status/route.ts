import dns from 'node:dns';
import { NextResponse } from 'next/server';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore in environments where not supported
}

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      payment_id?: string;
      order_id?: string;
    };

    const paymentId = body.payment_id?.trim();
    const orderId = body.order_id?.trim();

    if (!paymentId && !orderId) {
      return NextResponse.json(
        { ok: false, error: 'Payment ID atau Order ID wajib disertakan.' },
        { status: 400 }
      );
    }

    const payUrl =
      process.env.NEXARIN_PAY_URL || 'https://173.212.201.15.nip.io/v1/payments';
    const baseUrl = payUrl.replace(/\/+$/, '');
    const apiKey =
      process.env.NEXARIN_PAY_API_KEY ||
      'nxr_live_a0276bc9eaa3a2671a5b582b1496b9b8bfd0c82f';

    const targetId = paymentId || orderId;
    const verifyUrl = `${baseUrl}/${targetId}/verify`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const rawText = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      data = { raw: rawText };
    }

    // Jika verify gagal karena ID belum support POST /verify, fallback ke GET /v1/payments/:id
    if (!res.ok && res.status === 404 && paymentId) {
      try {
        const getRes = await fetch(`${baseUrl}/${paymentId}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'x-api-key': apiKey,
          },
        });
        if (getRes.ok) {
          const getData = (await getRes.json().catch(() => ({}))) as Record<
            string,
            unknown
          >;
          const getStatus = String(
            getData?.status || (getData?.data as Record<string, unknown>)?.status || ''
          ).toUpperCase();
          const isGetPaid = ['PAID', 'SUCCESS', 'COMPLETED'].includes(getStatus);
          return NextResponse.json({
            ok: true,
            status: isGetPaid ? 'PAID' : getStatus || 'PENDING',
            is_paid: isGetPaid,
            message: isGetPaid
              ? 'Pembayaran berhasil diverifikasi (Lunas).'
              : 'Menunggu pembayaran.',
            data: getData,
          });
        }
      } catch {
        // Fallback GET error ignored
      }
    }

    const statusStr = String(data?.status || '').toUpperCase();
    const isPaid = ['PAID', 'SUCCESS', 'COMPLETED'].includes(statusStr);

    return NextResponse.json({
      ok: true,
      status: isPaid ? 'PAID' : statusStr || 'PENDING',
      is_paid: isPaid,
      message:
        (typeof data?.message === 'string' ? data.message : null) ||
        (isPaid
          ? 'Pembayaran berhasil diverifikasi (Lunas).'
          : 'Menunggu pembayaran. Silakan selesaikan transaksi lalu cek kembali.'),
      data,
    });
  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      {
        ok: false,
        error: isTimeout
          ? 'Timeout saat menghubungi server Mayar untuk verifikasi.'
          : error instanceof Error
          ? error.message
          : 'Gagal memeriksa status pembayaran.',
      },
      { status: 200 }
    );
  }
}
