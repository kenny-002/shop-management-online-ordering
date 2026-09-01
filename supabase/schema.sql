-- 🏪 SHOP MANAGEMENT & ONLINE ORDERING SYSTEM - SUPABASE DATABASE SCHEMA
-- Execute this SQL script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fhdfxqiimepanqxoagsq/sql

-- 1. SHOP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.shop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Sri Samundi Store & Tea Stall',
  description TEXT,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT DEFAULT 'dinesh2122007@gmail.com',
  google_maps_url TEXT,
  opening_hours TEXT,
  delivery_enabled BOOLEAN DEFAULT true,
  delivery_charge NUMERIC DEFAULT 30,
  minimum_order NUMERIC DEFAULT 100,
  delivery_areas TEXT,
  upi_id TEXT,
  qr_code_url TEXT,
  auto_generate_bill BOOLEAN DEFAULT true,
  auto_send_bill BOOLEAN DEFAULT true,
  preferred_delivery_method TEXT DEFAULT 'WHATSAPP',
  invoice_prefix TEXT DEFAULT 'INV-',
  message_template TEXT,
  sms_api_key TEXT,
  whatsapp_api_key TEXT,
  owner_email TEXT DEFAULT 'dinesh2122007@gmail.com',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT,
  purchase_price NUMERIC DEFAULT 0,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'pcs',
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  owner_email TEXT DEFAULT 'dinesh2122007@gmail.com',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_mobile TEXT,
  delivery_address JSONB,
  subtotal NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  delivery_charge NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'CASH',
  payment_status TEXT DEFAULT 'PENDING',
  order_status TEXT DEFAULT 'PENDING',
  notes TEXT,
  invoice_number TEXT,
  invoice_url TEXT,
  invoice_token TEXT,
  owner_email TEXT DEFAULT 'dinesh2122007@gmail.com',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  purchase_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0
);

-- 6. BILLS TABLE (POS Invoices)
CREATE TABLE IF NOT EXISTS public.bills (
  id TEXT PRIMARY KEY,
  bill_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_mobile TEXT,
  subtotal NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  delivery_charge NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'CASH',
  invoice_number TEXT,
  invoice_url TEXT,
  invoice_token TEXT,
  owner_email TEXT DEFAULT 'dinesh2122007@gmail.com',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BILL ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.bill_items (
  id TEXT PRIMARY KEY,
  bill_id TEXT REFERENCES public.bills(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  purchase_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0
);

-- 8. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'GENERAL',
  amount NUMERIC NOT NULL DEFAULT 0,
  date TEXT,
  notes TEXT,
  owner_email TEXT DEFAULT 'dinesh2122007@gmail.com',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INVESTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.investments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'CAPITAL',
  amount NUMERIC NOT NULL DEFAULT 0,
  date TEXT,
  notes TEXT,
  owner_email TEXT DEFAULT 'dinesh2122007@gmail.com',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STOCK MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  movement_type TEXT DEFAULT 'PURCHASE',
  note TEXT,
  owner_email TEXT DEFAULT 'dinesh2122007@gmail.com',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DISABLE RLS TO ALLOW FULL ACCESS FOR STORE OWNER AND ANONYMOUS APP DISPATCH
ALTER TABLE public.shop DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements DISABLE ROW LEVEL SECURITY;
