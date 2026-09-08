import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/supabase-server';
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
function sanitizeOrderForDb(order: Order, userId: string) {
  const { ...header } = order;
  return {
    id: header.id,
    user_id: userId,
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

// GET /api/orders - Returns customer orders (filtered by user) or all orders for owner
export async function GET(req: NextRequest) {
  try {
    const authCookie = req.cookies.get('owner_auth')?.value;
    const authHeader = req.headers.get('x-owner-auth');
    const isOwner = authCookie === 'true' || authHeader === 'true';

    if (isOwner) {
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
              try { parsedAddress = JSON.parse(o.delivery_address); } catch {}
            }
            const relatedItems = dbOrderItems ? dbOrderItems.filter((it) => it.order_id === o.id) : o.items || [];
            const formattedOrd: Order = {
              ...o,
              delivery_address: parsedAddress,
              items: relatedItems.length > 0 ? relatedItems : o.items || [],
            };
            const existingIdx = globalOrderStore.findIndex((e) => e.id === o.id);
            if (existingIdx >= 0) globalOrderStore[existingIdx] = { ...globalOrderStore[existingIdx], ...formattedOrd };
            else globalOrderStore.push(formattedOrd);
          });
        }

        if (dbBills && dbBills.length > 0) {
          dbBills.forEach((b) => {
            const relatedItems = dbBillItems ? dbBillItems.filter((it) => it.bill_id === b.id) : b.items || [];
            const formattedBill: Bill = {
              ...b,
              items: relatedItems.length > 0 ? relatedItems : b.items || [],
            };
            const existingIdx = globalBillStore.findIndex((e) => e.id === b.id);
            if (existingIdx >= 0) globalBillStore[existingIdx] = { ...globalBillStore[existingIdx], ...formattedBill };
            else globalBillStore.push(formattedBill);
          });
        }
      }

      return NextResponse.json({
        success: true,
        orders: globalOrderStore,
        bills: globalBillStore,
      });
    }

    // Customer route: Require authenticated user
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in to view your orders.' }, { status: 401 });
    }

    let userOrders: Order[] = [];

    if (isSupabaseConfigured && supabase) {
      const { data: dbOrders } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', authenticatedUser.id)
        .order('created_at', { ascending: false });

      if (dbOrders) {
        userOrders = dbOrders.map((o) => {
          let parsedAddress = o.delivery_address;
          if (typeof o.delivery_address === 'string' && o.delivery_address.trim().startsWith('{')) {
            try { parsedAddress = JSON.parse(o.delivery_address); } catch {}
          }
          return {
            ...o,
            delivery_address: parsedAddress,
            items: o.order_items || o.items || [],
          } as Order;
        });
      }
    } else {
      userOrders = globalOrderStore.filter((o) => o.user_id === authenticatedUser.id);
    }

    return NextResponse.json({
      success: true,
      orders: userOrders,
      bills: [],
    });
  } catch (err: unknown) {
    console.error('[API /api/orders GET Error]', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/orders - Creates new customer order (authenticated) or POS bill (owner)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type = 'ORDER', data } = body;

    if (!data || !data.id || (type === 'ORDER' && Number(data.total_amount) < 0) || (type === 'BILL' && Number(data.total) < 0)) {
      return NextResponse.json({ success: false, error: 'Invalid payload: Valid ID and non-negative total required' }, { status: 400 });
    }

    if (type === 'ORDER') {
      const authenticatedUser = await getAuthenticatedUser(req);
      if (!authenticatedUser) {
        return NextResponse.json({ success: false, error: 'Please log in to place an order.' }, { status: 401 });
      }

      const userId = authenticatedUser.id;
      const orderData: Order = {
        ...data,
        user_id: userId,
      };

      const existingIdx = globalOrderStore.findIndex((o) => o.id === orderData.id);
      if (existingIdx >= 0) {
        globalOrderStore[existingIdx] = orderData;
      } else {
        globalOrderStore.unshift(orderData);
      }

      // Persist to Supabase with user_id
      if (isSupabaseConfigured && supabase) {
        const dbPayload = sanitizeOrderForDb(orderData, userId);
        const { error } = await supabase.from('orders').upsert(dbPayload);
        if (error) console.warn('[Supabase Order Upsert Notice]', error.message || error);

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

      return NextResponse.json({ success: true, order: orderData });
    } else if (type === 'BILL') {
      const authCookie = req.cookies.get('owner_auth')?.value;
      const authHeader = req.headers.get('x-owner-auth');
      if (authCookie !== 'true' && authHeader !== 'true') {
        return NextResponse.json({ success: false, error: 'Unauthorized: Owner access required' }, { status: 401 });
      }

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
      return NextResponse.json({ success: true, bill: billData });
    }

    return NextResponse.json({ success: false, error: 'Unknown payload type' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process order';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/orders - Updates order status across all devices (Owner only)
export async function PUT(req: NextRequest) {
  try {
    const authCookie = req.cookies.get('owner_auth')?.value;
    const authHeader = req.headers.get('x-owner-auth');
    if (authCookie !== 'true' && authHeader !== 'true') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Owner access required' }, { status: 401 });
    }

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

    return NextResponse.json({ success: true, orderId, status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update order status';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
