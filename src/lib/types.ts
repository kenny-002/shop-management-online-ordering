export interface ShopSettings {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  address: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  google_maps_url: string;
  opening_hours: string;
  delivery_enabled: boolean;
  delivery_charge: number;
  minimum_order: number;
  delivery_areas: string;
  upi_id: string;
  qr_code_url: string;
  auto_generate_bill?: boolean;
  auto_send_bill?: boolean;
  preferred_delivery_method?: 'WHATSAPP' | 'SMS' | 'BOTH';
  invoice_prefix?: string;
  message_template?: string;
  sms_api_key?: string;
  whatsapp_api_key?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  address?: string;
  area?: string;
  city?: string;
  pincode?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  image_url: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  brand: string;
  description: string;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  low_stock_limit: number;
  image_url: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export type DeliveryStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';

export type DeliveryMethod = 'WHATSAPP' | 'SMS' | 'BOTH';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_mobile: string;
  customer_email?: string;
  subtotal: number;
  discount: number;
  delivery_charge: number;
  total_amount: number;
  payment_method: 'UPI' | 'Cash' | 'Card' | 'Other';
  payment_status: PaymentStatus;
  payment_ref?: string;
  payment_proof_url?: string;
  delivery_type: 'Home Delivery' | 'Shop Pickup';
  delivery_address?: {
    address: string;
    area: string;
    city: string;
    pincode: string;
    instructions?: string;
  };
  order_status: OrderStatus;
  items: OrderItem[];
  notes?: string;
  invoice_number?: string;
  invoice_url?: string;
  invoice_token?: string;
  invoice_generated_at?: string;
  invoice_sent_at?: string;
  invoice_delivery_status?: DeliveryStatus;
  invoice_delivery_method?: DeliveryMethod;
  created_at: string;
}

export interface Investment {
  id: string;
  amount: number;
  category: 'Stock Purchase' | 'Shop Equipment' | 'Furniture' | 'Renovation' | 'Marketing' | 'Other';
  description: string;
  date: string;
  created_at?: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: 'Rent' | 'Electricity' | 'Transport' | 'Salary' | 'Maintenance' | 'Marketing' | 'Packaging' | 'Other';
  description: string;
  date: string;
  created_at?: string;
}

export interface BillItem {
  id: string;
  bill_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  subtotal: number;
}

export interface Bill {
  id: string;
  bill_number: string;
  order_id?: string;
  customer_name: string;
  customer_phone?: string;
  customer_mobile: string;
  subtotal: number;
  discount: number;
  delivery_charge: number;
  total: number;
  payment_method: 'Cash' | 'UPI' | 'Card' | 'Other';
  items: BillItem[];
  invoice_number: string;
  invoice_url: string;
  invoice_token: string;
  invoice_generated_at: string;
  invoice_sent_at?: string;
  invoice_delivery_status: DeliveryStatus;
  invoice_delivery_method?: DeliveryMethod;
  created_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  movement_type: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT';
  reference_id?: string;
  note?: string;
  created_at: string;
}
