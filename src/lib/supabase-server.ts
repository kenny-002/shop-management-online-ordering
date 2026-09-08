import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from Server Component or Route Handler
        }
      },
    },
  });
}

export async function getAuthenticatedUser(req?: Request) {
  try {
    const supabaseServer = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabaseServer.auth.getUser();
    if (user) return user;

    if (req) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const {
          data: { user: tokenUser },
        } = await supabaseServer.auth.getUser(token);
        if (tokenUser) return tokenUser;
      }
    }
    return null;
  } catch (err) {
    console.error('[getAuthenticatedUser Error]', err);
    return null;
  }
}
