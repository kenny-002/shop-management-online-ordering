-- 🏪 SEED DATA FOR SHOP MANAGEMENT & ONLINE ORDERING SYSTEM

-- 1. INITIAL SHOP SETTINGS
INSERT INTO public.shop (id, name, description, logo_url, address, phone, email, google_maps_url, opening_hours, delivery_enabled, delivery_charge, minimum_order, upi_id, qr_code_url)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'FreshMart Local Supermarket',
    'Your trusted neighborhood store for fresh groceries, daily essentials, organic produce, dairy, and household supplies.',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    '123 Main Market Road, Green Park, Sector 4, New Delhi, 110016',
    '+91 98765 43210',
    'contact@freshmartlocal.com',
    'https://maps.google.com/?q=28.5562,77.2008',
    'Mon - Sat: 7:00 AM - 10:00 PM | Sun: 8:00 AM - 9:00 PM',
    TRUE,
    40.00,
    200.00,
    'freshmart@upi',
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=freshmart@upi&pn=FreshMart%20Store'
) ON CONFLICT DO NOTHING;

-- 2. CATEGORIES (10 Categories)
INSERT INTO public.categories (id, name, image_url) VALUES
('c0000000-0000-0000-0000-000000000001', 'Rice & Grains', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80'),
('c0000000-0000-0000-0000-000000000002', 'Edible Oils & Ghee', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80'),
('c0000000-0000-0000-0000-000000000003', 'Atta, Flours & Pulses', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80'),
('c0000000-0000-0000-0000-000000000004', 'Spices & Masalas', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80'),
('c0000000-0000-0000-0000-000000000005', 'Dairy & Bakery', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=300&q=80'),
('c0000000-0000-0000-0000-000000000006', 'Snacks & Beverages', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=300&q=80'),
('c0000000-0000-0000-0000-000000000007', 'Fresh Vegetables', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80'),
('c0000000-0000-0000-0000-000000000008', 'Fresh Fruits', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=300&q=80'),
('c0000000-0000-0000-0000-000000000009', 'Personal Care', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80'),
('c0000000-0000-0000-0000-000000000010', 'Household Cleaners', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=300&q=80')
ON CONFLICT (name) DO NOTHING;

-- 3. PRODUCTS (30 Products across 10 categories)
INSERT INTO public.products (id, name, category_id, brand, description, purchase_price, selling_price, stock_quantity, low_stock_limit, image_url) VALUES
-- Rice & Grains
('p0000000-0000-0000-0000-000000000001', 'Premium Basmati Rice 5 KG', 'c0000000-0000-0000-0000-000000000001', 'India Gate', 'Aromatic long grain basmati rice, perfect for biryanis & everyday feasts.', 300.00, 350.00, 25, 5, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000002', 'Sona Masoori Rice 10 KG', 'c0000000-0000-0000-0000-000000000001', 'Fortune', 'Lightweight and aromatic medium-grain rice, easily digestible.', 520.00, 600.00, 18, 5, 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000003', 'Brown Rice 1 KG', 'c0000000-0000-0000-0000-000000000001', '24 Mantra', 'Unpolished 100% organic brown rice full of natural dietary fiber.', 110.00, 140.00, 12, 3, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'),

-- Edible Oils & Ghee
('p0000000-0000-0000-0000-000000000004', 'Sunflower Refined Oil 1L', 'c0000000-0000-0000-0000-000000000002', 'Fortune', 'Healthy heart cooking oil rich in Vitamin E.', 110.00, 135.00, 30, 8, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000005', 'Pure Cow Ghee 500ml', 'c0000000-0000-0000-0000-000000000002', 'Amul', 'Traditional granular pure cow ghee with rich aroma.', 280.00, 330.00, 4, 5, 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000006', 'Mustard Oil 1L', 'c0000000-0000-0000-0000-000000000002', 'Dhara', 'Kachi Ghani cold-pressed pungent mustard oil.', 125.00, 150.00, 20, 5, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80'),

-- Atta & Pulses
('p0000000-0000-0000-0000-000000000007', 'Chakki Fresh Atta 5 KG', 'c0000000-0000-0000-0000-000000000003', 'Aashirvaad', '100% pure whole wheat grain flour for soft rotis.', 190.00, 225.00, 22, 5, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000008', 'Toor Dal / Arhar Dal 1 KG', 'c0000000-0000-0000-0000-000000000003', 'Tata Sampann', 'Unpolished protein-dense split pigeon peas.', 120.00, 155.00, 3, 5, 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000009', 'Moong Dal Yellow 1 KG', 'c0000000-0000-0000-0000-000000000003', 'Tata Sampann', 'Cleaned, high quality split yellow lentils.', 105.00, 130.00, 15, 4, 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=400&q=80'),

-- Spices & Masalas
('p0000000-0000-0000-0000-000000000010', 'Turmeric Powder 200g', 'c0000000-0000-0000-0000-000000000004', 'MDH', 'Rich yellow Haldi powder with natural curcumin oils.', 35.00, 48.00, 40, 10, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000011', 'Red Chilli Powder 200g', 'c0000000-0000-0000-0000-000000000004', 'Everest', 'Vibrant red hot chilli powder for authentic flavor.', 42.00, 58.00, 35, 10, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000012', 'Garam Masala 100g', 'c0000000-0000-0000-0000-000000000004', 'Catch', 'Aromatic blend of ground whole spices.', 55.00, 75.00, 0, 5, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'),

-- Dairy & Bakery
('p0000000-0000-0000-0000-000000000013', 'Full Cream Milk 1L', 'c0000000-0000-0000-0000-000000000005', 'Amul Gold', 'Fresh pasteurized full cream milk packet.', 56.00, 66.00, 45, 10, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000014', 'Salted Butter 500g', 'c0000000-0000-0000-0000-000000000005', 'Amul', 'Creamy delicious salted butter block.', 220.00, 260.00, 2, 5, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000015', 'Whole Wheat Bread 400g', 'c0000000-0000-0000-0000-000000000005', 'Britannia', 'Soft multi-grain healthy brown bread loaf.', 32.00, 45.00, 20, 5, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80'),

-- Snacks & Beverages
('p0000000-0000-0000-0000-000000000016', 'Green Tea Bags (100 Pcs)', 'c0000000-0000-0000-0000-000000000006', 'Lipton', 'Pure antioxidant rich green tea bags.', 180.00, 240.00, 16, 5, 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000017', 'Roasted Salted Almonds 250g', 'c0000000-0000-0000-0000-000000000006', 'Nutraj', 'Crunchy premium California almonds.', 210.00, 280.00, 14, 4, 'https://images.unsplash.com/photo-1508061252478-f71694df6b7b?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000018', 'Dark Chocolate Bar 100g', 'c0000000-0000-0000-0000-000000000006', 'Cadbury Bournville', '50% rich cocoa dark chocolate bar.', 70.00, 95.00, 28, 5, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80'),

-- Fresh Vegetables
('p0000000-0000-0000-0000-000000000019', 'Organic Potatoes 1 KG', 'c0000000-0000-0000-0000-000000000007', 'Local Farm', 'Freshly harvested farm-fresh potatoes.', 22.00, 32.00, 50, 10, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000020', 'Red Onions 1 KG', 'c0000000-0000-0000-0000-000000000007', 'Local Farm', 'Crisp red onions essential for daily cooking.', 28.00, 40.00, 60, 10, 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000021', 'Ripe Hybrid Tomatoes 1 KG', 'c0000000-0000-0000-0000-000000000007', 'Local Farm', 'Juicy firm red tomatoes.', 30.00, 45.00, 40, 8, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80'),

-- Fresh Fruits
('p0000000-0000-0000-0000-000000000022', 'Shimla Apples 1 KG', 'c0000000-0000-0000-0000-000000000008', 'Fresh Orchards', 'Sweet and crunchy red juicy apples.', 120.00, 160.00, 20, 5, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000023', 'Robusta Bananas 1 Dozen', 'c0000000-0000-0000-0000-000000000008', 'Fresh Orchards', 'Naturally ripened nutrient-dense bananas.', 35.00, 55.00, 30, 8, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80'),

-- Personal Care
('p0000000-0000-0000-0000-000000000024', 'Gentle Body Wash 500ml', 'c0000000-0000-0000-0000-000000000009', 'Nivea', 'Nourishing shower gel with moisturizing oils.', 210.00, 290.00, 12, 3, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000025', 'Anti-Dandruff Shampoo 340ml', 'c0000000-0000-0000-0000-000000000009', 'Head & Shoulders', 'Cool menthol scalp therapy shampoo.', 240.00, 310.00, 10, 3, 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80'),

-- Household Cleaners
('p0000000-0000-0000-0000-000000000026', 'Dishwash Liquid Gel 750ml', 'c0000000-0000-0000-0000-000000000010', 'Vim Lemon', 'Concentrated lemon dishwash gel formula.', 115.00, 145.00, 25, 5, 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=400&q=80'),
('p0000000-0000-0000-0000-000000000027', 'Disinfectant Floor Cleaner 1L', 'c0000000-0000-0000-0000-000000000010', 'Lizol Citrus', 'Kills 99.9% germs with refreshing citrus scent.', 140.00, 175.00, 18, 4, 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=400&q=80')
ON CONFLICT (id) DO NOTHING;

-- 4. INITIAL INVESTMENTS
INSERT INTO public.investments (amount, category, description, date) VALUES
(100000.00, 'Stock Purchase', 'Initial bulk inventory purchase for shop opening', CURRENT_DATE - INTERVAL '60 days'),
(35000.00, 'Shop Equipment', 'Commercial refrigerator & POS barcode scanner', CURRENT_DATE - INTERVAL '45 days'),
(15000.00, 'Furniture', 'Wooden shelving racks & counter display', CURRENT_DATE - INTERVAL '40 days'),
(20000.00, 'Renovation', 'LED lighting & shop frontage signboard painting', CURRENT_DATE - INTERVAL '30 days');

-- 5. INITIAL EXPENSES
INSERT INTO public.expenses (amount, category, description, date) VALUES
(25000.00, 'Rent', 'Monthly shop premises rent payment', CURRENT_DATE - INTERVAL '30 days'),
(4500.00, 'Electricity', 'Commercial power bill for lights & cooling', CURRENT_DATE - INTERVAL '15 days'),
(3000.00, 'Transport', 'Goods delivery freight & fuel expenses', CURRENT_DATE - INTERVAL '10 days'),
(12000.00, 'Salary', 'Helper staff monthly salary', CURRENT_DATE - INTERVAL '5 days'),
(1500.00, 'Packaging', 'Eco-friendly shopping bags & box tape', CURRENT_DATE - INTERVAL '2 days');
