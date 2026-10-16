import dns from 'node:dns';
import { NextResponse } from 'next/server';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore in environments where not supported
}

export const runtime = 'nodejs';

interface CheckoutItem {
  description: string;
  quantity: number;
  unit_price_idr: number;
}

interface CheckoutCustomer {
  name: string;
  email: string;
  mobile?: string;
  phone?: string;
}

interface CheckoutPayload {
  order_id?: string;
  description?: string;
  amount_idr?: number;
  items?: CheckoutItem[];
  customer?: CheckoutCustomer;
}

export async function POST(request: Request) {
  let body: CheckoutPayload;

  try {
    body = (await request.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Format data JSON tidak valid.' },
      { status: 400 }
    );
  }

  const payUrl =
    process.env.NEXARIN_PAY_URL || 'https://173.212.201.15.nip.io/v1/payments';
  const apiKey = process.env.NEXARIN_PAY_API_KEY || 'nxr_live_9f79d...';

  const orderId = body.order_id || `ORDER-${Date.now()}`;
  const items: CheckoutItem[] =
    body.items && body.items.length > 0
      ? body.items
      : [
          {
            description: body.description || 'Pembelian Produk Hadroh Khoirunnada',
            quantity: 1,
            unit_price_idr: body.amount_idr || 75000,
          },
        ];

  const calculatedTotal = items.reduce(
    (sum, item) => sum + (item.unit_price_idr || 0) * (item.quantity || 1),
    0
  );

  const customer: CheckoutCustomer = {
    name: body.customer?.name?.trim() || 'Admin Khoirunnada',
    email: body.customer?.email?.trim() || 'admin@khoirunnada.org',
    mobile: body.customer?.mobile?.trim() || body.customer?.phone?.trim() || '081234567890',
  };

  const payload = {
    order_id: orderId,
    reference_id: orderId,
    amount: calculatedTotal,
    amount_idr: calculatedTotal,
    description: body.description || items[0]?.description || 'Transaksi Shop Testing Khoirunnada',
    items,
    customer: {
      name: customer.name,
      email: customer.email,
      mobile: customer.mobile,
      phone: customer.mobile,
    },
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(payUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'Idempotency-Key': `idemp-${orderId}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const rawText = await res.text();
    let data: Record<string, unknown> | null = null;
    try {
      data = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      data = { raw: rawText };
    }

    if (!res.ok) {
      const detailObj = data?.detail;
      const detailMsg =
        typeof detailObj === 'string'
          ? detailObj
          : typeof detailObj === 'object' && detailObj !== null && 'message' in detailObj
          ? String((detailObj as { message: unknown }).message)
          : null;

      let errorMessage =
        detailMsg ||
        (typeof data?.error === 'string' ? data.error : null) ||
        (typeof (data?.error as { message?: string })?.message === 'string'
          ? (data?.error as { message?: string }).message
          : null) ||
        (typeof data?.message === 'string' ? data.message : null) ||
        `Payment Gateway mengembalikan status ${res.status}`;

      const detailCode =
        typeof detailObj === 'object' && detailObj !== null && 'code' in detailObj
          ? String((detailObj as { code: unknown }).code)
          : null;

      if (detailCode === 'ENVIRONMENT_INACTIVE') {
        errorMessage =
          'Project environment di Nexarin Payment Gateway saat ini belum aktif (ENVIRONMENT_INACTIVE). Silakan aktifkan status environment project melalui Control Panel / Bot Nexarin Payment.';
      } else if (res.status === 401 && (!apiKey || apiKey.endsWith('...'))) {
        errorMessage =
          'API Key Nexarin Payment belum diatur atau masih berupa placeholder di .env.local (NEXARIN_PAY_API_KEY). Silakan masukkan API Key lengkap Anda.';
      }

      return NextResponse.json(
        {
          ok: false,
          error: errorMessage,
          status_code: res.status,
          details: data,
        },
        { status: 200 } // Return 200 so UI can display friendly error state without unhandled fetch exception
      );
    }

    const checkoutUrl =
      (typeof data?.checkout_url === 'string' ? data.checkout_url : null) ||
      (typeof (data?.data as { checkout_url?: string })?.checkout_url === 'string'
        ? (data?.data as { checkout_url?: string }).checkout_url
        : null) ||
      (typeof data?.payment_url === 'string' ? data.payment_url : null) ||
      (typeof data?.url === 'string' ? data.url : null);

    return NextResponse.json({
      ok: true,
      order_id: orderId,
      amount_idr: calculatedTotal,
      checkout_url: checkoutUrl,
      payment_id:
        (typeof data?.payment_id === 'string' ? data.payment_id : null) ||
        (typeof (data?.data as { payment_id?: string })?.payment_id === 'string'
          ? (data?.data as { payment_id?: string }).payment_id
          : null),
      data,
    });
  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      {
        ok: false,
        error: isTimeout
          ? 'Koneksi ke Payment Gateway timeout (15 detik).'
          : error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menghubungi server pembayaran.',
      },
      { status: 200 }
    );
  }
}


