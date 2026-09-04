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
    console.warn('[Supabase fetchShop Notice]', err);
    return null;
  }
}

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((item) => ({
      id: item.id,
      name: item.name || 'Unnamed Product',
      category_id: item.category_id || 'cat-1',
      brand: item.brand || 'Sri Samundi',
      description: item.description || '',
      purchase_price: Number(item.purchase_price) || 0,
      selling_price: Number(item.selling_price) || 0,
      stock_quantity: Number(item.stock_quantity) || 0,
      low_stock_limit: Number(item.low_stock_limit) || 5,
      image_url: item.image_url || 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=400&q=80',
      is_active: item.is_available !== false && item.is_active !== false,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
    })) as Product[];
  } catch (err: unknown) {
    console.warn('[Supabase fetchProducts Notice]', err);
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
    console.warn('[Supabase fetchCategories Notice]', err);
    return null;
  }
}

export async function fetchOrdersFromSupabase(userId?: string): Promise<Order[] | null> {
  if (!supabase) return null;
  try {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: ordersData, error: ordersErr } = await query;

    if (ordersErr || !ordersData) return null;

    return ordersData.map((ord) => ({
      ...ord,
      items: ord.order_items || [],
    })) as Order[];
  } catch (err: unknown) {
    console.warn('[Supabase fetchOrders Notice]', err);
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
    console.warn('[Supabase fetchBills Notice]', err);
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
    console.warn('[Supabase fetchExpenses Notice]', err);
    return null;
  }
}

export async function fetchInvestmentsFromSupabase(): Promise<Investment[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('investments').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map((inv) => ({
      id: inv.id,
      amount: Number(inv.amount) || 0,
      category: inv.category || 'Stock Purchase',
      description: inv.description || inv.title || inv.notes || inv.category || 'Store Investment',
      date: inv.date || new Date().toISOString().split('T')[0],
      created_at: inv.created_at,
    })) as Investment[];
  } catch (err: unknown) {
    console.warn('[Supabase fetchInvestments Notice]', err);
    return null;
  }
}

// --- PERSISTENCE HELPERS ---

export async function saveShopSettingsToSupabase(settings: Partial<ShopSettings>): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('shop').upsert(settings);
  } catch (err: unknown) {
    console.warn('[Supabase saveShopSettings Notice]', err);
  }
}

export async function ensureCategoriesInSupabase(): Promise<void> {
  if (!supabase) return;
  try {
    const defaultCategories = [
      { id: 'cat-1', name: 'Tea & Coffee', image_url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=400&q=80' },
      { id: 'cat-2', name: 'Snacks & Biscuits', image_url: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=400&q=80' },
      { id: 'cat-3', name: 'Cool Drinks & Ice Creams', image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80' },
      { id: 'cat-4', name: 'Dairy & Milk', image_url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80' },
      { id: 'cat-5', name: 'Rice & Grains', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80' },
      { id: 'cat-6', name: 'Edible Oils & Ghee', image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80' },
      { id: 'cat-7', name: 'Spices & Essentials', image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80' },
    ];
    await supabase.from('categories').upsert(defaultCategories, { onConflict: 'id' });
  } catch (err: unknown) {
    console.warn('[Supabase ensureCategories Notice]', err);
  }
}

export function toUuid(str: string): string {
  if (!str) return '00000000-0000-4000-8000-000000000000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(12, '0').repeat(3).substring(0, 32);
  return `${hex.substring(0,8)}-${hex.substring(8,12)}-4${hex.substring(13,16)}-a${hex.substring(17,20)}-${hex.substring(20,32)}`;
}

export async function saveProductToSupabase(product: Product): Promise<void> {
  if (!supabase) return;
  try {
    const uuidId = toUuid(product.id);
    const catId = product.category_id || 'cat-1';
    try {
      await supabase.from('categories').upsert({
        id: catId,
        name: catId === 'cat-1' ? 'Tea & Coffee' : catId === 'cat-2' ? 'Snacks & Biscuits' : catId === 'cat-3' ? 'Cool Drinks & Ice Creams' : catId === 'cat-4' ? 'Dairy & Milk' : 'General Store',
        image_url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=400&q=80',
      });
    } catch {}

    const dbPayload = {
      id: uuidId,
      name: product.name,
      brand: product.brand || 'Sri Samundi',
      description: product.description || '',
      category_id: catId,
      purchase_price: Number(product.purchase_price) || 0,
      selling_price: Number(product.selling_price) || 0,
      stock_quantity: Number(product.stock_quantity) || 0,
      low_stock_limit: Number(product.low_stock_limit) || 5,
      image_url: product.image_url || '',
      is_available: product.is_active !== false,
      owner_email: 'dinesh2122007@gmail.com',
      created_at: product.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('products').upsert(dbPayload);
    if (error) {
      console.warn('[Supabase saveProduct Notice]', error.message || error);
      // Fallback: Retry with standard schema payload if custom columns throw column errors
      const fallbackPayload: Record<string, unknown> = {
        id: uuidId,
        name: product.name,
        description: product.description || '',
        purchase_price: Number(product.purchase_price) || 0,
        selling_price: Number(product.selling_price) || 0,
        stock_quantity: Number(product.stock_quantity) || 0,
        image_url: product.image_url || '',
        created_at: product.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const retryRes = await supabase.from('products').upsert(fallbackPayload);
      if (retryRes.error) {
        console.error('[Supabase saveProduct Fallback Error]', retryRes.error.message || retryRes.error);
      }
    }
  } catch (err: unknown) {
    console.warn('[Supabase saveProduct Notice]', err);
  }
}

export async function deleteProductFromSupabase(id: string): Promise<void> {
  if (!supabase) return;
  try {
    const uuidId = toUuid(id);
    await supabase.from('products').delete().eq('id', uuidId);
    if (id !== uuidId) {
      await supabase.from('products').delete().eq('id', id);
    }
  } catch (err: unknown) {
    console.warn('[Supabase deleteProduct Notice]', err);
  }
}

export async function clearAllProductsFromSupabase(): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (err: unknown) {
    console.warn('[Supabase clearAllProducts Notice]', err);
  }
}

export async function saveOrderToSupabase(order: Order): Promise<void> {
  if (!supabase) return;
  try {
    const { items, ...orderHeader } = order;
    const dbOrder = {
      ...orderHeader,
      user_id: orderHeader.user_id || null,
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
      console.warn('[Supabase saveOrder Notice]', error.message || error);
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
    console.warn('[Supabase saveOrder Warning]', err);
  }
}

export async function saveBillToSupabase(bill: Bill): Promise<void> {
  if (!supabase) return;
  try {
    const { items, ...billHeader } = bill;
    const { error } = await supabase.from('bills').upsert(billHeader);
    if (error) {
      console.warn('[Supabase saveBill Notice]', error.message || error);
      return;
    }

    if (items && items.length > 0) {
      const dbItems = items.map((it) => ({
        ...it,
        bill_id: bill.id,
      }));
      await supabase.from('bill_items').upsert(dbItems);
    }
  } catch (err: unknown) {
    console.warn('[Supabase saveBill Warning]', err);
  }
}

export async function saveExpenseToSupabase(expense: Expense): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('expenses').upsert(expense);
  } catch (err: unknown) {
    console.warn('[Supabase saveExpense Notice]', err);
  }
}

export async function saveInvestmentToSupabase(investment: Investment): Promise<void> {
  if (!supabase) return;
  try {
    const dbPayload = {
      id: investment.id,
      title: investment.description || investment.category || 'Store Investment',
      description: investment.description || '',
      notes: investment.description || '',
      category: investment.category || 'Stock Purchase',
      amount: Number(investment.amount) || 0,
      date: investment.date || new Date().toISOString().split('T')[0],
      owner_email: 'dinesh2122007@gmail.com',
      created_at: investment.created_at || new Date().toISOString(),
    };
    const { error } = await supabase.from('investments').upsert(dbPayload);
    if (error) {
      console.warn('[Supabase saveInvestment Notice]', error.message || error);
    }
  } catch (err: unknown) {
    console.warn('[Supabase saveInvestment Notice]', err);
  }
}

export async function saveStockMovementToSupabase(movement: StockMovement): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('stock_movements').upsert(movement);
  } catch (err: unknown) {
    console.warn('[Supabase saveStockMovement Notice]', err);
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
    console.warn('[Supabase updateShopSettings Notice]', err);
  }
}
