import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Product } from '@/lib/types';

// In-memory global store fallback for instant multi-device sync
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalProductStore: Product[] = (globalThis as any)._productCloudStore || [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any)._productCloudStore = globalProductStore;

// Helper to sanitize product for Supabase PostgreSQL schema
function sanitizeProductForDb(product: Partial<Product>) {
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    category_id: product.category_id || 'cat-1',
    purchase_price: Number(product.purchase_price) || 0,
    selling_price: Number(product.selling_price) || 0,
    stock_quantity: Number(product.stock_quantity) || 0,
    image_url: product.image_url || '',
    owner_email: 'dinesh2122007@gmail.com',
    created_at: product.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// GET /api/products - Returns all products for all devices
export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Update in-memory store
        globalProductStore.length = 0;
        data.forEach((item) => {
          globalProductStore.push({
            id: item.id,
            name: item.name,
            category_id: item.category_id || 'cat-1',
            brand: item.brand || 'Sri Samundi',
            description: item.description || '',
            purchase_price: Number(item.purchase_price) || 0,
            selling_price: Number(item.selling_price) || 0,
            stock_quantity: Number(item.stock_quantity) || 0,
            low_stock_limit: Number(item.low_stock_limit) || 5,
            image_url: item.image_url || '',
            is_active: item.is_available !== false,
            created_at: item.created_at,
            updated_at: item.updated_at,
          });
        });
        return NextResponse.json({ success: true, products: globalProductStore, source: 'supabase' });
      }
    }

    return NextResponse.json({ success: true, products: globalProductStore, source: 'cloud-store' });
  } catch (err: unknown) {
    console.error('[API /api/products GET Error]', err);
    return NextResponse.json({ success: true, products: globalProductStore, source: 'cloud-store-fallback' });
  }
}

// POST /api/products - Saves/upserts a product from any owner device
export async function POST(req: NextRequest) {
  try {
    const product: Product = await req.json();

    if (!product || !product.id || !product.name) {
      return NextResponse.json({ success: false, error: 'Invalid product payload' }, { status: 400 });
    }

    // 1. Update in-memory multi-device store
    const existingIndex = globalProductStore.findIndex((p) => p.id === product.id);
    if (existingIndex >= 0) {
      globalProductStore[existingIndex] = { ...globalProductStore[existingIndex], ...product };
    } else {
      globalProductStore.unshift(product);
    }

    // 2. Persist to Supabase PostgreSQL database
    if (isSupabaseConfigured && supabase) {
      const dbPayload = sanitizeProductForDb(product);
      const { error } = await supabase.from('products').upsert(dbPayload);
      if (error) {
        console.error('[Supabase Product Upsert Error]', error);
      }
    }

    return NextResponse.json({ success: true, product, products: globalProductStore });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/products - Deletes a product by ID across all devices
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

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
