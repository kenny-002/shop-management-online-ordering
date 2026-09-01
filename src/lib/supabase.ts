import { createClient } from '@supabase/supabase-js';
import {
  ShopSettings,
  Category,
  Product,
  Order,
  Bill,
  Expense,
  Investment,
  StockMovement,
} from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'your-supabase-anon-key-here'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// --- SUPABASE DATABASE HELPERS ---

export async function fetchShopFromSupabase(): Promise<Partial<ShopSettings> | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('shop').select('*').limit(1).single();
    if (error || !data) return null;
    return data as Partial<ShopSettings>;
  } catch (err: unknown) {
    console.error('Error fetching shop from Supabase:', err);
    return null;
  }
}

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;
    return data as Product[];
  } catch (err: unknown) {
    console.error('Error fetching products from Supabase:', err);
    return null;
  }
}

export async function fetchCategoriesFromSupabase(): Promise<Category[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
    if (error || !data || data.length === 0) return null;
    return data as Category[];
  } catch (err: unknown) {
    console.error('Error fetching categories from Supabase:', err);
    return null;
  }
}

export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  if (!supabase) return null;
  try {
    const { data: ordersData, error: ordersErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (ordersErr || !ordersData) return null;

    return ordersData.map((ord) => ({
      ...ord,
      items: ord.order_items || [],
    })) as Order[];
  } catch (err: unknown) {
    console.error('Error fetching orders from Supabase:', err);
    return null;
  }
}

export async function fetchBillsFromSupabase(): Promise<Bill[] | null> {
  if (!supabase) return null;
  try {
    const { data: billsData, error: billsErr } = await supabase
      .from('bills')
      .select('*, bill_items(*)')
      .order('created_at', { ascending: false });

    if (billsErr || !billsData) return null;

    return billsData.map((b) => ({
      ...b,
      items: b.bill_items || [],
    })) as Bill[];
  } catch (err: unknown) {
    console.error('Error fetching bills from Supabase:', err);
    return null;
  }
}

export async function fetchExpensesFromSupabase(): Promise<Expense[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;
    return data as Expense[];
  } catch (err: unknown) {
    console.error('Error fetching expenses from Supabase:', err);
    return null;
  }
}

export async function fetchInvestmentsFromSupabase(): Promise<Investment[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('investments').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;
    return data as Investment[];
  } catch (err: unknown) {
    console.error('Error fetching investments from Supabase:', err);
    return null;
  }
}

// --- PERSISTENCE HELPERS ---

export async function saveShopSettingsToSupabase(settings: Partial<ShopSettings>): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('shop').upsert(settings);
  } catch (err: unknown) {
    console.error('Error saving shop settings to Supabase:', err);
  }
}

export async function saveProductToSupabase(product: Product): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('products').upsert(product);
  } catch (err: unknown) {
    console.error('Error saving product to Supabase:', err);
  }
}

export async function deleteProductFromSupabase(id: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('products').delete().eq('id', id);
  } catch (err: unknown) {
    console.error('Error deleting product from Supabase:', err);
  }
}

export async function saveOrderToSupabase(order: Order): Promise<void> {
  if (!supabase) return;
  try {
    const { items, ...orderHeader } = order;
    const dbOrder = {
      ...orderHeader,
      delivery_address: typeof orderHeader.delivery_address === 'object'
        ? JSON.stringify(orderHeader.delivery_address)
        : orderHeader.delivery_address || '',
      customer_mobile: orderHeader.customer_mobile || orderHeader.customer_phone || '',
      customer_phone: orderHeader.customer_phone || orderHeader.customer_mobile || '',
      owner_email: 'dinesh2122007@gmail.com',
      created_at: orderHeader.created_at || new Date().toISOString(),
    };

    const { error } = await supabase.from('orders').upsert(dbOrder);
    if (error) {
      console.error('[Supabase saveOrderToSupabase Error]', error);
    }

    if (items && items.length > 0) {
      const dbItems = items.map((it) => ({
        id: it.id || `oi-${Date.now()}-${Math.random()}`,
        order_id: order.id,
        product_id: it.product_id,
        product_name: it.product_name,
        quantity: it.quantity,
        purchase_price: Number(it.purchase_price) || 0,
        selling_price: Number(it.selling_price) || 0,
        subtotal: Number(it.subtotal) || 0,
      }));
      await supabase.from('order_items').upsert(dbItems);
    }
  } catch (err: unknown) {
    console.error('Error saving order to Supabase:', err);
  }
}

export async function saveBillToSupabase(bill: Bill): Promise<void> {
  if (!supabase) return;
  try {
    const { items, ...billHeader } = bill;
    const { error } = await supabase.from('bills').upsert(billHeader);
    if (error) throw error;

    if (items && items.length > 0) {
      const dbItems = items.map((it) => ({
        ...it,
        bill_id: bill.id,
      }));
      await supabase.from('bill_items').upsert(dbItems);
    }
  } catch (err: unknown) {
    console.error('Error saving bill to Supabase:', err);
  }
}

export async function saveExpenseToSupabase(expense: Expense): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('expenses').upsert(expense);
  } catch (err: unknown) {
    console.error('Error saving expense to Supabase:', err);
  }
}

export async function saveInvestmentToSupabase(investment: Investment): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('investments').upsert(investment);
  } catch (err: unknown) {
    console.error('Error saving investment to Supabase:', err);
  }
}

export async function saveStockMovementToSupabase(movement: StockMovement): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('stock_movements').upsert(movement);
  } catch (err: unknown) {
    console.error('Error saving stock movement to Supabase:', err);
  }
}

export async function updateShopSettingsInSupabase(settings: Partial<ShopSettings>): Promise<void> {
  if (!supabase) return;
  try {
    const { data: existing } = await supabase.from('shop').select('id').limit(1).single();
    if (existing && existing.id) {
      await supabase.from('shop').update(settings).eq('id', existing.id);
    } else {
      await supabase.from('shop').insert(settings);
    }
  } catch (err: unknown) {
    console.error('Error updating shop settings in Supabase:', err);
  }
}
