-- 🏪 SHOP MANAGEMENT & ONLINE ORDERING SYSTEM - SUPABASE POSTGRESQL SCHEMA

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('owner', 'customer')) DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SHOP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.shop (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'FreshMart Local Supermarket',
    description TEXT DEFAULT 'Your trusted neighborhood store for fresh groceries, daily essentials, organic produce, and household supplies.',
    logo_url TEXT DEFAULT 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    address TEXT DEFAULT '123 Main Market Road, Green Park, Sector 4, New Delhi, 110016',
    phone TEXT DEFAULT '+91 98765 43210',
    email TEXT DEFAULT 'contact@freshmartlocal.com',
    latitude NUMERIC DEFAULT 28.5562,
    longitude NUMERIC DEFAULT 77.2008,
    google_maps_url TEXT DEFAULT 'https://maps.google.com/?q=28.5562,77.2008',
    opening_hours TEXT DEFAULT 'Mon - Sat: 7:00 AM - 10:00 PM | Sun: 8:00 AM - 9:00 PM',
    delivery_enabled BOOLEAN DEFAULT TRUE,
    delivery_charge NUMERIC(10,2) DEFAULT 40.00,
    minimum_order NUMERIC(10,2) DEFAULT 200.00,
    delivery_areas TEXT DEFAULT 'Sector 1, Sector 2, Sector 3, Sector 4, Green Park, Hauz Khas',
    upi_id TEXT DEFAULT 'freshmart@upi',
    qr_code_url TEXT DEFAULT 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
    auto_generate_bill BOOLEAN DEFAULT TRUE,
    auto_send_bill BOOLEAN DEFAULT TRUE,
    preferred_delivery_method TEXT DEFAULT 'WHATSAPP' CHECK (preferred_delivery_method IN ('WHATSAPP', 'SMS', 'BOTH')),
    invoice_prefix TEXT DEFAULT 'INV-',
    message_template TEXT DEFAULT 'Thank you for shopping with [SHOP NAME]. Your order #[ORDER_NO] has been completed. Total Amount: ₹[AMOUNT]. Your digital invoice is ready: [INVOICE_LINK]',
    sms_api_key TEXT,
    whatsapp_api_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    brand TEXT,
    description TEXT,
    purchase_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_limit INT NOT NULL DEFAULT 5 CHECK (low_stock_limit >= 0),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ORDERS TABLE (WITH DIGITAL BILL DELIVERY COLUMNS)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10,2) DEFAULT 0.00,
    delivery_charge NUMERIC(10,2) DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_method TEXT DEFAULT 'UPI' CHECK (payment_method IN ('UPI', 'Cash', 'Card', 'Other')),
    payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
    payment_ref TEXT,
    payment_proof_url TEXT,
    delivery_type TEXT DEFAULT 'Home Delivery' CHECK (delivery_type IN ('Home Delivery', 'Shop Pickup')),
    delivery_address JSONB,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_mobile TEXT NOT NULL DEFAULT '',
    customer_email TEXT,
    order_status TEXT DEFAULT 'Pending' CHECK (order_status IN ('Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled')),
    notes TEXT,
    invoice_number TEXT,
    invoice_url TEXT,
    invoice_token TEXT,
    invoice_generated_at TIMESTAMP WITH TIME ZONE,
    invoice_sent_at TIMESTAMP WITH TIME ZONE,
    invoice_delivery_status TEXT DEFAULT 'PENDING' CHECK (invoice_delivery_status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED')),
    invoice_delivery_method TEXT CHECK (invoice_delivery_method IN ('WHATSAPP', 'SMS', 'BOTH')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ORDER ITEMS TABLE (PRICE SNAPSHOTS)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    purchase_price NUMERIC(10,2) NOT NULL,
    selling_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL
);

-- 7. INVESTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL CHECK (category IN ('Stock Purchase', 'Shop Equipment', 'Furniture', 'Renovation', 'Marketing', 'Other')),
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL CHECK (category IN ('Rent', 'Electricity', 'Transport', 'Salary', 'Maintenance', 'Marketing', 'Packaging', 'Other')),
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. BILLS (POS INVOICES) TABLE (WITH DIGITAL BILL DELIVERY COLUMNS)
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_number TEXT UNIQUE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    customer_name TEXT DEFAULT 'Walk-in Customer',
    customer_phone TEXT,
    customer_mobile TEXT NOT NULL DEFAULT '',
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10,2) DEFAULT 0.00,
    delivery_charge NUMERIC(10,2) DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_method TEXT DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'UPI', 'Card', 'Other')),
    invoice_number TEXT NOT NULL,
    invoice_url TEXT NOT NULL,
    invoice_token TEXT NOT NULL,
    invoice_generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invoice_sent_at TIMESTAMP WITH TIME ZONE,
    invoice_delivery_status TEXT DEFAULT 'PENDING' CHECK (invoice_delivery_status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED')),
    invoice_delivery_method TEXT CHECK (invoice_delivery_method IN ('WHATSAPP', 'SMS', 'BOTH')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. BILL ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.bill_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID REFERENCES public.bills(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    purchase_price NUMERIC(10,2) NOT NULL,
    selling_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL
);

-- 11. STOCK MOVEMENTS LOG TABLE
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT')),
    reference_id TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Public Read access for active storefront elements
CREATE POLICY "Allow public read access for shop info" ON public.shop FOR SELECT USING (true);
CREATE POLICY "Allow public read access for categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access for active products" ON public.products FOR SELECT USING (is_active = true);

-- Orders: Anyone can insert orders; users can read their own or owners read all
CREATE POLICY "Allow public create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Functions & Triggers for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_timestamp
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
