import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, toUuid, saveProductToSupabase } from '@/lib/supabase';
import { Product } from '@/lib/types';

// In-memory global store fallback for instant multi-device sync
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalProductStore: Product[] = (globalThis as any)._productCloudStore || [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any)._productCloudStore = globalProductStore;

// GET /api/products - Returns all products for all devices
export async function GET() {
  try {
    let supabaseProducts: Product[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const realItems = data.filter((item) => item && item.id && !item.id.startsWith('p-samundi-'));
        supabaseProducts = realItems.map((item) => ({
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
        }));
      }
    }

    // Merge Supabase DB products with in-memory global product store
    const map = new Map<string, Product>();
    supabaseProducts.forEach((p) => map.set(p.id, p));
    globalProductStore.forEach((p) => {
      if (p && p.id && !map.has(p.id)) {
        map.set(p.id, p);
      }
    });

    const combinedProducts = Array.from(map.values()).filter((p) => p && p.id && !p.id.startsWith('p-samundi-'));

    // Keep global store in sync
    globalProductStore.length = 0;
    globalProductStore.push(...combinedProducts);

    return NextResponse.json({ success: true, products: globalProductStore, source: 'cloud-merged' });
  } catch (err: unknown) {
    console.error('[API /api/products GET Error]', err);
    return NextResponse.json({ success: true, products: globalProductStore, source: 'cloud-store-fallback' });
  }
}

// POST /api/products - Saves/upserts a product from any owner device
export async function POST(req: NextRequest) {
  try {
    const authCookie = req.cookies.get('owner_auth')?.value;
    const authHeader = req.headers.get('x-owner-auth');
    if (authCookie !== 'true' && authHeader !== 'true') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Owner access required' }, { status: 401 });
    }

    const product: Product = await req.json();

    if (!product || !product.id || !product.name || Number(product.selling_price) < 0 || Number(product.stock_quantity) < 0) {
      return NextResponse.json({ success: false, error: 'Invalid product payload: name, valid selling price, and stock quantity required' }, { status: 400 });
    }

    // 1. Update in-memory multi-device store
    const existingIndex = globalProductStore.findIndex((p) => p.id === product.id || p.id === toUuid(product.id));
    if (existingIndex >= 0) {
      globalProductStore[existingIndex] = { ...globalProductStore[existingIndex], ...product };
    } else {
      globalProductStore.unshift(product);
    }

    // 2. Persist to Supabase PostgreSQL database
    if (isSupabaseConfigured && supabase) {
      await saveProductToSupabase(product);
    }

    return NextResponse.json({ success: true, product, products: globalProductStore });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/products - Deletes a product by ID or clears all products across all devices
export async function DELETE(req: NextRequest) {
  try {
    const authCookie = req.cookies.get('owner_auth')?.value;
    const authHeader = req.headers.get('x-owner-auth');
    if (authCookie !== 'true' && authHeader !== 'true') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Owner access required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const clearAll = searchParams.get('clear_all');

    if (clearAll === 'true') {
      globalProductStore.length = 0;
      if (isSupabaseConfigured && supabase) {
        await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }
      return NextResponse.json({ success: true, cleared: true, products: [] });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    // Remove from in-memory store
    const idx = globalProductStore.findIndex((p) => p.id === id);
    if (idx >= 0) {
      globalProductStore.splice(idx, 1);
    }

    // Remove from Supabase
    if (isSupabaseConfigured && supabase) {
      await supabase.from('products').delete().eq('id', id);
    }

    return NextResponse.json({ success: true, id, products: globalProductStore });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
