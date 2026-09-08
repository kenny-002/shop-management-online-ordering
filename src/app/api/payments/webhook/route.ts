import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// POST /api/payments/webhook - Secure Asynchronous Webhook Endpoint
export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const signature = req.headers.get('x-razorpay-signature') || req.headers.get('x-webhook-signature');

    const rawBody = await req.text();

    if (!webhookSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Webhook secret is not configured on server.',
        },
        { status: 400 }
      );
    }

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Missing webhook signature header' },
        { status: 401 }
      );
    }

    // 1. Verify Webhook Cryptographic Signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('[Webhook Security Alert] Invalid webhook signature received');
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Signature mismatch' },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // 2. Process Gateway Event (e.g. Razorpay payment.captured / payment.failed)
    if (event === 'payment.captured' || payload.status === 'SUCCESS') {
      const paymentEntity = payload.payload?.payment?.entity || payload.payment;
      const orderId = paymentEntity?.notes?.order_id || paymentEntity?.order_id;
      const paymentId = paymentEntity?.id || payload.payment_id;
      const amountPaid = Number(paymentEntity?.amount ? paymentEntity.amount / 100 : payload.amount);

      if (!orderId) {
        return NextResponse.json({ success: true, message: 'Event processed, no matching order_id' });
      }

      if (isSupabaseConfigured && supabase) {
        // Idempotency check: Get current order state
        const { data: dbOrder } = await supabase.from('orders').select('*').eq('id', orderId).single();

        if (dbOrder) {
          if (dbOrder.payment_status === 'Paid') {
            return NextResponse.json({ success: true, message: 'Idempotent notice: Order already marked as Paid' });
          }

          // Verify amount matches
          if (Number(dbOrder.total_amount) !== amountPaid) {
            console.warn(`[Webhook Alert] Amount mismatch! Order total ₹${dbOrder.total_amount}, paid ₹${amountPaid}`);
            return NextResponse.json({ success: false, error: 'Amount mismatch' }, { status: 400 });
          }

          const paidAt = new Date().toISOString();
          await supabase
            .from('orders')
            .update({
              payment_status: 'Paid',
              payment_provider: 'RAZORPAY',
              payment_id: paymentId,
              paid_at: paidAt,
              updated_at: paidAt,
            })
            .eq('id', orderId);
        }
      }
    } else if (event === 'payment.failed' || payload.status === 'FAILED') {
      const paymentEntity = payload.payload?.payment?.entity || payload.payment;
      const orderId = paymentEntity?.notes?.order_id || paymentEntity?.order_id;

      if (orderId && isSupabaseConfigured && supabase) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'Failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      }
    }

    return NextResponse.json({ success: true, event });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
