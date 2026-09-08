import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/supabase-server';

// POST /api/payments/verify - Server-side cryptographic payment verification
export async function POST(req: NextRequest) {
  try {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in to verify payment.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      gateway_payment_id,
      gateway_order_id,
      gateway_signature,
      order_id,
      amount,
      provider = 'RAZORPAY',
    } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET || process.env.PAYMENT_GATEWAY_SECRET;

    if (!secret) {
      return NextResponse.json(
        {
          success: false,
          requiresCredentials: true,
          error:
            'Automatic UPI verification requires a supported payment gateway account (Razorpay/Cashfree/PhonePe) and server-side credentials. The existing GPay QR remains a manual payment option with UTR tracking and is not treated as automatic payment proof.',
        },
        { status: 400 }
      );
    }

    if (!gateway_payment_id || !gateway_order_id || !gateway_signature || !order_id || !amount) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification payload: Missing required payment fields' },
        { status: 400 }
      );
    }

    // 1. Verify Cryptographic Signature Server-Side
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${gateway_order_id}|${gateway_payment_id}`)
      .digest('hex');

    if (generatedSignature !== gateway_signature) {
      console.warn('[Payment Security Alert] Invalid payment signature detected for order:', order_id);
      return NextResponse.json(
        { success: false, error: 'Payment verification failed: Cryptographic signature mismatch' },
        { status: 400 }
      );
    }

    // 2. Amount Verification & DB Update
    const paidAt = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      // Check existing order in DB to verify amount matches checkout total
      const { data: dbOrder } = await supabase.from('orders').select('*').eq('id', order_id).single();

      if (dbOrder && Number(dbOrder.total_amount) !== Number(amount)) {
        console.warn(`[Payment Security Alert] Amount mismatch! Expected ₹${dbOrder.total_amount}, got ₹${amount}`);
        return NextResponse.json(
          { success: false, error: 'Payment verification failed: Payment amount mismatch' },
          { status: 400 }
        );
      }

      // Update Order Payment Status Server-Side
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'Paid',
          payment_provider: provider,
          payment_id: gateway_payment_id,
          payment_order_id: gateway_order_id,
          paid_at: paidAt,
          updated_at: paidAt,
        })
        .eq('id', order_id);

      if (error) {
        console.error('[Supabase Payment Status Update Error]', error);
        return NextResponse.json(
          { success: false, error: 'Failed to update order payment status in database' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment successfully verified by server',
      payment_id: gateway_payment_id,
      paid_at: paidAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to verify payment';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
