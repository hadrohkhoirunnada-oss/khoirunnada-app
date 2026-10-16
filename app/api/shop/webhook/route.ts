import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Nexarin Payment Outgoing Webhook Receiver
 * Endpoint: POST /api/shop/webhook
 */
export async function POST(request: Request) {
  try {
    const eventId = request.headers.get('x-nxr-event-id');
    const timestamp = request.headers.get('x-nxr-timestamp');

    const rawBody = await request.text();
    let bodyData: Record<string, unknown> = {};

    try {
      bodyData = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      // Body bukan JSON
    }

    console.log('[Nexarin Webhook] Event received:', {
      eventId,
      timestamp,
      event: bodyData?.event,
      paymentId: (bodyData?.data as Record<string, unknown>)?.payment_id,
      orderId: (bodyData?.data as Record<string, unknown>)?.order_id,
      status: (bodyData?.data as Record<string, unknown>)?.status,
    });

    return NextResponse.json({
      received: true,
      event_id: eventId,
      timestamp,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        received: false,
        error: error instanceof Error ? error.message : 'Unknown webhook error',
      },
      { status: 400 }
    );
  }
}
