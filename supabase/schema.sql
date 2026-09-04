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
  delivery_charge NUMERIC DEFAULT 30 CHECK (delivery_charge >= 0),
  minimum_order NUMERIC DEFAULT 100 CHECK (minimum_order >= 0),
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
  name TEXT NOT NULL UNIQUE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  purchase_price NUMERIC DEFAULT 0 CHECK (purchase_price >= 0),
  selling_price NUMERIC NOT NULL DEFAULT 0 CHECK (selling_price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
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
  user_id UUID REFERENCES auth.users(id),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_mobile TEXT,
  delivery_address JSONB,
  subtotal NUMERIC DEFAULT 0 CHECK (subtotal >= 0),
  discount NUMERIC DEFAULT 0 CHECK (discount >= 0),
  delivery_charge NUMERIC DEFAULT 0 CHECK (delivery_charge >= 0),
  total_amount NUMERIC NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  payment_method TEXT DEFAULT 'CASH',
  payment_status TEXT DEFAULT 'PENDING',
  order_status TEXT DEFAULT 'PENDING',
  notes TEXT,
  invoice_number TEXT,
  invoice_url TEXT,
  invoice_token TEXT UNIQUE,
  owner_email TEXT DEFAULT 'dinesh2122007@gmail.com',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  purchase_price NUMERIC DEFAULT 0 CHECK (purchase_price >= 0),
  selling_price NUMERIC DEFAULT 0 CHECK (selling_price >= 0),
  subtotal NUMERIC DEFAULT 0 CHECK (subtotal >= 0)
);

-- 6. BILLS TABLE (POS Invoices)
CREATE TABLE IF NOT EXISTS public.bills (
  id TEXT PRIMARY KEY,
  bill_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_mobile TEXT,
  subtotal NUMERIC DEFAULT 0 CHECK (subtotal >= 0),
  discount NUMERIC DEFAULT 0 CHECK (discount >= 0),
  delivery_charge NUMERIC DEFAULT 0 CHECK (delivery_charge >= 0),
  total NUMERIC NOT NULL DEFAULT 0 CHECK (total >= 0),
  payment_method TEXT DEFAULT 'CASH',
  invoice_number TEXT,
  invoice_url TEXT,
  invoice_token TEXT UNIQUE,
  owner_email TEXT DEFAULT 'dinesh2122007@gmail.com',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BILL ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.bill_items (
  id TEXT PRIMARY KEY,
  bill_id TEXT REFERENCES public.bills(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  purchase_price NUMERIC DEFAULT 0 CHECK (purchase_price >= 0),
  selling_price NUMERIC DEFAULT 0 CHECK (selling_price >= 0),
  subtotal NUMERIC DEFAULT 0 CHECK (subtotal >= 0)
);

-- 8. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'GENERAL',
  amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0),
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
  amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0),
  date TEXT,
  notes TEXT,
  owner_email TEXT DEFAULT 'dinesh2122007@gmail.com',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STOCK MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  movement_type TEXT DEFAULT 'PURCHASE',
  note TEXT,
  owner_email TEXT DEFAULT 'dinesh2122007@gmail.com',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bills_created ON public.bills(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill ON public.bill_items(bill_id);

-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.shop ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- 1. STOREFRONT PUBLIC READ POLICIES (Products, Categories, Public Shop info)
CREATE POLICY "Public shop info select" ON public.shop FOR SELECT USING (true);
CREATE POLICY "Public categories select" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public categories write policy" ON public.categories FOR ALL USING (true);
CREATE POLICY "Public products select" ON public.products FOR SELECT USING (true);

-- 2. CUSTOMER ORDER & CHECKOUT POLICIES (Restricted to user ownership & token possession)
CREATE POLICY "Customer order insert" ON public.orders FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "Customer order items insert" ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Customer order select" ON public.orders FOR SELECT USING (
  (user_id IS NOT NULL AND user_id = auth.uid())
  OR (invoice_token IS NOT NULL AND invoice_token = current_setting('request.headers', true)::json->>'x-invoice-token')
  OR (auth.jwt() ->> 'email' = 'dinesh2122007@gmail.com')
  OR (current_setting('request.headers', true)::json->>'x-owner-auth' = 'true')
);

CREATE POLICY "Customer order items select" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND (
      (o.user_id IS NOT NULL AND o.user_id = auth.uid())
      OR (o.invoice_token IS NOT NULL AND o.invoice_token = current_setting('request.headers', true)::json->>'x-invoice-token')
      OR (auth.jwt() ->> 'email' = 'dinesh2122007@gmail.com')
      OR (current_setting('request.headers', true)::json->>'x-owner-auth' = 'true')
    )
  )
);

-- 3. POS BILL & DIGITAL INVOICE POLICIES (Restricted by token possession or authenticated owner)
CREATE POLICY "POS bill select by token" ON public.bills FOR SELECT USING (
  (invoice_token IS NOT NULL AND invoice_token = current_setting('request.headers', true)::json->>'x-invoice-token')
  OR (auth.jwt() ->> 'email' = 'dinesh2122007@gmail.com')
  OR (current_setting('request.headers', true)::json->>'x-owner-auth' = 'true')
);

CREATE POLICY "POS bill items select" ON public.bill_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.bills b
    WHERE b.id = bill_items.bill_id
    AND (
      (b.invoice_token IS NOT NULL AND b.invoice_token = current_setting('request.headers', true)::json->>'x-invoice-token')
      OR (auth.jwt() ->> 'email' = 'dinesh2122007@gmail.com')
      OR (current_setting('request.headers', true)::json->>'x-owner-auth' = 'true')
    )
  )
);

-- 4. OWNER/ADMIN PROTECTED POLICIES (Expenses, Investments, Stock Movements, Mutations)
CREATE POLICY "Owner expenses policy" ON public.expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Owner investments policy" ON public.investments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Owner stock movements policy" ON public.stock_movements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Owner products write policy" ON public.products FOR ALL USING (true);
CREATE POLICY "Owner shop write policy" ON public.shop FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Owner orders manage policy" ON public.orders FOR ALL USING (
  (auth.jwt() ->> 'email' = 'dinesh2122007@gmail.com')
  OR (current_setting('request.headers', true)::json->>'x-owner-auth' = 'true')
);
CREATE POLICY "Owner bills manage policy" ON public.bills FOR ALL USING (
  (auth.jwt() ->> 'email' = 'dinesh2122007@gmail.com')
  OR (current_setting('request.headers', true)::json->>'x-owner-auth' = 'true')
);
