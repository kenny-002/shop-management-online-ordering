import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Investment } from '@/lib/types';

// In-memory global store for instant multi-device investments sync
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalInvestmentStore: Investment[] = (globalThis as any)._investmentCloudStore || [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any)._investmentCloudStore = globalInvestmentStore;

// GET /api/investments - Returns all store investments for owner dashboard
export async function GET(req: NextRequest) {
  try {
    const authCookie = req.cookies.get('owner_auth')?.value;
    const authHeader = req.headers.get('x-owner-auth');
    const isOwner = authCookie === 'true' || authHeader === 'true';

    if (isOwner && isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        data.forEach((inv) => {
          const mapped: Investment = {
            id: inv.id,
            amount: Number(inv.amount) || 0,
            category: inv.category || 'Stock Purchase',
            description: inv.description || inv.title || inv.notes || inv.category || 'Store Investment',
            date: inv.date || new Date().toISOString().split('T')[0],
            created_at: inv.created_at,
          };
          const idx = globalInvestmentStore.findIndex((i) => i.id === inv.id);
          if (idx >= 0) {
            globalInvestmentStore[idx] = { ...globalInvestmentStore[idx], ...mapped };
          } else {
            globalInvestmentStore.push(mapped);
          }
        });
      }
    }

    return NextResponse.json({ success: true, investments: globalInvestmentStore });
  } catch (err: unknown) {
    console.error('[API /api/investments GET Error]', err);
    return NextResponse.json({ success: true, investments: globalInvestmentStore });
  }
}

// POST /api/investments - Adds/upserts an investment record in Supabase and memory store
export async function POST(req: NextRequest) {
  try {
    const authCookie = req.cookies.get('owner_auth')?.value;
    const authHeader = req.headers.get('x-owner-auth');
    if (authCookie !== 'true' && authHeader !== 'true') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Owner access required' }, { status: 401 });
    }

    const investment: Investment = await req.json();

    if (!investment || !investment.id || Number(investment.amount) <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid investment payload: ID and positive amount required' }, { status: 400 });
    }

    const idx = globalInvestmentStore.findIndex((i) => i.id === investment.id);
    if (idx >= 0) {
      globalInvestmentStore[idx] = { ...globalInvestmentStore[idx], ...investment };
    } else {
      globalInvestmentStore.unshift(investment);
    }

    if (isSupabaseConfigured && supabase) {
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
        console.warn('[Supabase Investment Upsert Notice]', error.message || error);
      }
    }

    return NextResponse.json({ success: true, investment, investments: globalInvestmentStore });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save investment';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/investments - Deletes an investment record
export async function DELETE(req: NextRequest) {
  try {
    const authCookie = req.cookies.get('owner_auth')?.value;
    const authHeader = req.headers.get('x-owner-auth');
    if (authCookie !== 'true' && authHeader !== 'true') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Owner access required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Investment ID required' }, { status: 400 });
    }

    const idx = globalInvestmentStore.findIndex((i) => i.id === id);
    if (idx >= 0) {
      globalInvestmentStore.splice(idx, 1);
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('investments').delete().eq('id', id);
    }

    return NextResponse.json({ success: true, id, investments: globalInvestmentStore });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete investment';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
