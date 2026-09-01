import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Order, Bill } from '@/lib/types';

// In-memory cloud store fallback for instant multi-device order sync
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalOrderStore: Order[] = (globalThis as any)._orderCloudStore || [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any)._orderCloudStore = globalOrderStore;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalBillStore: Bill[] = (globalThis as any)._billCloudStore || [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any)._billCloudStore = globalBillStore;

// Helper to sanitize order header for Supabase DB
function sanitizeOrderForDb(order: Order) {
  const { items, ...header } = order;
  return {
    id: header.id,
    order_number: header.order_number,
    customer_name: header.customer_name || 'Customer',
    customer_email: header.customer_email || '',
    customer_phone: header.customer_phone || header.customer_mobile || '',
    customer_mobile: header.customer_mobile || header.customer_phone || '',
    delivery_type: header.delivery_type || 'Home Delivery',
    delivery_address: typeof header.delivery_address === 'object'
      ? JSON.stringify(header.delivery_address)
      : header.delivery_address || '',
    subtotal: Number(header.subtotal) || 0,
    discount: Number(header.discount) || 0,
    delivery_charge: Number(header.delivery_charge) || 0,
    total_amount: Number(header.total_amount) || 0,
    payment_method: header.payment_method || 'Cash',
    payment_status: header.payment_status || 'Pending',
    order_status: header.order_status || 'Pending',
    notes: header.notes || '',
    invoice_number: header.invoice_number || '',
    invoice_url: header.invoice_url || '',
    invoice_token: header.invoice_token || '',
    owner_email: 'dinesh2122007@gmail.com',
    created_at: header.created_at || new Date().toISOString(),
  };
}

// GET /api/orders - Returns all customer orders & bills for the owner dashboard
export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data: dbOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: dbOrderItems } = await supabase.from('order_items').select('*');

      const { data: dbBills } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: dbBillItems } = await supabase.from('bill_items').select('*');

      if (dbOrders && dbOrders.length > 0) {
        dbOrders.forEach((o) => {
          let parsedAddress = o.delivery_address;
          if (typeof o.delivery_address === 'string' && o.delivery_address.trim().startsWith('{')) {
            try {
              parsedAddress = JSON.parse(o.delivery_address);
            } catch (e) {}
          }

          const relatedItems = dbOrderItems
            ? dbOrderItems.filter((it) => it.order_id === o.id)
            : o.items || [];

          const formattedOrd: Order = {
            ...o,
            delivery_address: parsedAddress,
            items: relatedItems.length > 0 ? relatedItems : o.items || [],
          };

          const existingIdx = globalOrderStore.findIndex((existing) => existing.id === o.id);
          if (existingIdx >= 0) {
            globalOrderStore[existingIdx] = { ...globalOrderStore[existingIdx], ...formattedOrd };
          } else {
            globalOrderStore.push(formattedOrd);
          }
        });
      }

      if (dbBills && dbBills.length > 0) {
        dbBills.forEach((b) => {
          const relatedItems = dbBillItems
            ? dbBillItems.filter((it) => it.bill_id === b.id)
            : b.items || [];

          const formattedBill: Bill = {
            ...b,
            items: relatedItems.length > 0 ? relatedItems : b.items || [],
          };

          const existingIdx = globalBillStore.findIndex((existing) => existing.id === b.id);
          if (existingIdx >= 0) {
            globalBillStore[existingIdx] = { ...globalBillStore[existingIdx], ...formattedBill };
          } else {
            globalBillStore.push(formattedBill);
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      orders: globalOrderStore,
      bills: globalBillStore,
    });
  } catch (err: unknown) {
    console.error('[API /api/orders GET Error]', err);
    return NextResponse.json({
      success: true,
      orders: globalOrderStore,
      bills: globalBillStore,
    });
  }
}

// POST /api/orders - Receives newly placed customer order or created bill from ANY device
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type = 'ORDER', data } = body;

    if (!data || !data.id) {
      return NextResponse.json({ success: false, error: 'Invalid order payload' }, { status: 400 });
    }

    if (type === 'ORDER') {
      const orderData = data as Order;
      const existingIdx = globalOrderStore.findIndex((o) => o.id === orderData.id);
      if (existingIdx >= 0) {
        globalOrderStore[existingIdx] = orderData;
      } else {
        globalOrderStore.unshift(orderData);
      }

      // Persist to Supabase
      if (isSupabaseConfigured && supabase) {
        const dbPayload = sanitizeOrderForDb(orderData);
        const { error } = await supabase.from('orders').upsert(dbPayload);
        if (error) console.error('[Supabase Order Upsert Error]', error);

        if (orderData.items && orderData.items.length > 0) {
          const dbItems = orderData.items.map((it) => ({
            id: it.id || `oi-${Date.now()}-${Math.random()}`,
            order_id: orderData.id,
            product_id: it.product_id,
            product_name: it.product_name,
            quantity: it.quantity,
            purchase_price: Number(it.purchase_price) || 0,
            selling_price: Number(it.selling_price) || 0,
            subtotal: Number(it.subtotal) || 0,
          }));
          await supabase.from('order_items').upsert(dbItems);
        }
      }
      return NextResponse.json({ success: true, order: orderData, orders: globalOrderStore });
    } else if (type === 'BILL') {
      const billData = data as Bill;
      const existingIdx = globalBillStore.findIndex((b) => b.id === billData.id);
      if (existingIdx >= 0) {
        globalBillStore[existingIdx] = billData;
      } else {
        globalBillStore.unshift(billData);
      }

      if (isSupabaseConfigured && supabase) {
        const { items, ...billHeader } = billData;
        await supabase.from('bills').upsert({
          ...billHeader,
          owner_email: 'dinesh2122007@gmail.com',
        });

        if (items && items.length > 0) {
          const dbItems = items.map((it) => ({
            ...it,
            bill_id: billData.id,
          }));
          await supabase.from('bill_items').upsert(dbItems);
        }
      }
      return NextResponse.json({ success: true, bill: billData, bills: globalBillStore });
    }

    return NextResponse.json({ success: false, error: 'Unknown payload type' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process order';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/orders - Updates order status (e.g., Pending -> Confirmed -> Delivered) across all devices
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'orderId and status required' }, { status: 400 });
    }

    const targetOrder = globalOrderStore.find((o) => o.id === orderId);
    if (targetOrder) {
      targetOrder.order_status = status;
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('orders').update({ order_status: status, updated_at: new Date().toISOString() }).eq('id', orderId);
    }

    return NextResponse.json({ success: true, orderId, status, orders: globalOrderStore });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update order status';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
