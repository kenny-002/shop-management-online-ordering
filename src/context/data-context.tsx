'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ShopSettings,
  Category,
  Product,
  CartItem,
  Order,
  OrderStatus,
  Investment,
  Expense,
  Bill,
  StockMovement,
  CustomerProfile,
  DeliveryStatus,
  DeliveryMethod,
} from '@/lib/types';
import {
  isSupabaseConfigured,
  fetchShopFromSupabase,
  fetchProductsFromSupabase,
  fetchCategoriesFromSupabase,
  fetchOrdersFromSupabase,
  fetchBillsFromSupabase,
  fetchExpensesFromSupabase,
  fetchInvestmentsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  saveOrderToSupabase,
  saveBillToSupabase,
  saveExpenseToSupabase,
  saveInvestmentToSupabase,
  saveStockMovementToSupabase,
  updateShopSettingsInSupabase,
} from '@/lib/supabase';

export type {
  ShopSettings,
  Category,
  Product,
  CartItem,
  Order,
  OrderStatus,
  Investment,
  Expense,
  Bill,
  StockMovement,
  CustomerProfile,
  DeliveryStatus,
  DeliveryMethod,
};

// ORIGINAL SHOP BRANDING & DETAILS
const INITIAL_SHOP: ShopSettings = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Sri Samundi Store & Tea Stall',
  description:
    'Your local neighborhood store for fresh hot tea, coffee, daily groceries, cold drinks, packaged snacks, and daily home essentials.',
  logo_url:
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
  address: 'Sri Samundi Store & Tea Stall, Main Road',
  phone: '+91 81908 12500',
  email: 'dinesh2122007@gmail.com',
  latitude: 12.3999,
  longitude: 78.2181,
  google_maps_url: 'https://maps.app.goo.gl/92QnYifkpxdVkEv27',
  opening_hours: '24 Hours Open',
  delivery_enabled: true,
  delivery_charge: 30,
  minimum_order: 100,
  delivery_areas: 'Local Market, Main Road, Nearby Residences',
  upi_id: 'srisamundi@upi',
  qr_code_url:
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=srisamundi@upi&pn=Sri%20Samundi%20Store',
  auto_generate_bill: true,
  auto_send_bill: true,
  preferred_delivery_method: 'WHATSAPP',
  invoice_prefix: 'INV-',
  message_template:
    'Thank you for shopping with [SHOP NAME]. Your order #[ORDER_NO] has been completed. Total Amount: ₹[AMOUNT]. Your digital invoice is ready: [INVOICE_LINK]',
};

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Tea & Coffee', image_url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-2', name: 'Snacks & Biscuits', image_url: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-3', name: 'Cool Drinks & Beverages', image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-4', name: 'Dairy & Milk', image_url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-5', name: 'Rice & Grains', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-6', name: 'Edible Oils & Ghee', image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-7', name: 'Spices & Essentials', image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80' },
];

const INITIAL_PRODUCTS: Product[] = [];
const INITIAL_INVESTMENTS: Investment[] = [];
const INITIAL_EXPENSES: Expense[] = [];
const INITIAL_ORDERS: Order[] = [];

const INITIAL_REGISTERED_CUSTOMERS: CustomerProfile[] = [];

interface DataContextType {
  shop: ShopSettings;
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  investments: Investment[];
  expenses: Expense[];
  bills: Bill[];
  stockMovements: StockMovement[];
  isOwnerLoggedIn: boolean;
  isLoaded: boolean;

  registeredCustomers: CustomerProfile[];
  currentCustomer: CustomerProfile | null;
  loginCustomer: (email: string, phone: string, name?: string) => void;
  registerCustomer: (profile: Omit<CustomerProfile, 'id'>) => CustomerProfile;
  authenticateCustomer: (
    identifier: string,
    pass: string
  ) => { success: boolean; reason?: 'NOT_REGISTERED' | 'INVALID_PASSWORD'; customer?: CustomerProfile };
  logoutCustomer: () => void;
  updateCustomerProfile: (profile: Partial<CustomerProfile>) => void;

  loginOwner: () => void;
  logoutOwner: () => void;
  updateShopSettings: (settings: Partial<ShopSettings>) => void;
  clearAllDemoData: () => void;

  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  restockProduct: (id: string, qty: number, note?: string) => void;

  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  createOrder: (orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  dispatchBillNotification: (target: Order | Bill, method?: DeliveryMethod) => Promise<{ success: boolean; status: string; error?: string }>;

  addInvestment: (investment: Omit<Investment, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  createBill: (billData: Omit<Bill, 'id' | 'bill_number' | 'created_at' | 'invoice_number' | 'invoice_url' | 'invoice_token' | 'invoice_generated_at' | 'invoice_delivery_status'>) => Bill;

  totalSales: number;
  totalInvestments: number;
  totalExpenses: number;
  totalProductCostOfSales: number;
  grossProfit: number;
  netProfit: number;
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shop, setShop] = useState<ShopSettings>(INITIAL_SHOP);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [investments, setInvestments] = useState<Investment[]>(INITIAL_INVESTMENTS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [bills, setBills] = useState<Bill[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [registeredCustomers, setRegisteredCustomers] = useState<CustomerProfile[]>(INITIAL_REGISTERED_CUSTOMERS);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile | null>(null);

  // Load from LocalStorage + Supabase DB on mount for 100% data persistence
  useEffect(() => {
    async function initData() {
      try {
        // 1. ALWAYS load local storage data first so data is retained on refresh
        const savedShop = localStorage.getItem('shop_data');
        if (savedShop) {
          try {
            const parsed = JSON.parse(savedShop);
            parsed.name = 'Sri Samundi Store & Tea Stall';
            parsed.phone = '+91 81908 12500';
            parsed.google_maps_url = 'https://maps.app.goo.gl/92QnYifkpxdVkEv27';
            parsed.opening_hours = '24 Hours Open';
            setShop((prev) => ({ ...prev, ...parsed }));
          } catch (e) {}
        }

        const savedProducts = localStorage.getItem('products_data');
        if (savedProducts) {
          try { setProducts(JSON.parse(savedProducts)); } catch (e) {}
        }

        const savedOrders = localStorage.getItem('orders_data');
        if (savedOrders) {
          try { setOrders(JSON.parse(savedOrders)); } catch (e) {}
        }

        const savedInvestments = localStorage.getItem('investments_data');
        if (savedInvestments) {
          try { setInvestments(JSON.parse(savedInvestments)); } catch (e) {}
        }

        const savedExpenses = localStorage.getItem('expenses_data');
        if (savedExpenses) {
          try { setExpenses(JSON.parse(savedExpenses)); } catch (e) {}
        }

        const savedBills = localStorage.getItem('bills_data');
        if (savedBills) {
          try { setBills(JSON.parse(savedBills)); } catch (e) {}
        }

        const savedCart = localStorage.getItem('cart_data');
        if (savedCart) {
          try { setCart(JSON.parse(savedCart)); } catch (e) {}
        }

        const savedAuth = localStorage.getItem('owner_auth');
        if (savedAuth === 'true') setIsOwnerLoggedIn(true);

        const savedRegisteredCusts = localStorage.getItem('registered_customers_data');
        if (savedRegisteredCusts) {
          try {
            const parsedCusts: CustomerProfile[] = JSON.parse(savedRegisteredCusts);
            const filtered = parsedCusts.filter((c) => c.id !== 'cust-demo-1' && c.email !== 'ramesh.customer@example.com');
            setRegisteredCustomers(filtered);
          } catch (e) {}
        }

        const savedCust = localStorage.getItem('customer_user');
        if (savedCust) {
          try {
            const parsedCust: CustomerProfile = JSON.parse(savedCust);
            if (parsedCust && parsedCust.id !== 'cust-demo-1' && parsedCust.email !== 'ramesh.customer@example.com') {
              setCurrentCustomer(parsedCust);
            } else {
              localStorage.removeItem('customer_user');
              setCurrentCustomer(null);
            }
          } catch (e) {}
        }

        // 2. Fetch and merge Supabase database records if configured
        if (isSupabaseConfigured) {
          const dbShop = await fetchShopFromSupabase();
          if (dbShop && Object.keys(dbShop).length > 0) {
            setShop((prev) => ({ ...prev, ...dbShop }));
          }

          const dbProducts = await fetchProductsFromSupabase();
          if (dbProducts && dbProducts.length > 0) setProducts(dbProducts);

          const dbCategories = await fetchCategoriesFromSupabase();
          if (dbCategories && dbCategories.length > 0) setCategories(dbCategories);

          const dbOrders = await fetchOrdersFromSupabase();
          if (dbOrders && dbOrders.length > 0) setOrders(dbOrders);

          const dbBills = await fetchBillsFromSupabase();
          if (dbBills && dbBills.length > 0) setBills(dbBills);

          const dbExpenses = await fetchExpensesFromSupabase();
          if (dbExpenses && dbExpenses.length > 0) setExpenses(dbExpenses);

          const dbInvestments = await fetchInvestmentsFromSupabase();
          if (dbInvestments && dbInvestments.length > 0) setInvestments(dbInvestments);
        }
      } catch (e) {
        console.error('Error loading initial data:', e);
      } finally {
        setIsLoaded(true);
      }
    }

    initData();
  }, []);

  // Save to localStorage ONLY AFTER isLoaded IS TRUE
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('shop_data', JSON.stringify(shop));
  }, [shop, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('products_data', JSON.stringify(products));
  }, [products, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('orders_data', JSON.stringify(orders));
  }, [orders, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('investments_data', JSON.stringify(investments));
  }, [investments, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('expenses_data', JSON.stringify(expenses));
  }, [expenses, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('bills_data', JSON.stringify(bills));
  }, [bills, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('cart_data', JSON.stringify(cart));
  }, [cart, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('registered_customers_data', JSON.stringify(registeredCustomers));
  }, [registeredCustomers, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (currentCustomer) {
      localStorage.setItem('customer_user', JSON.stringify(currentCustomer));
    } else {
      localStorage.removeItem('customer_user');
    }
  }, [currentCustomer, isLoaded]);

  // Clear demo data completely
  const clearAllDemoData = () => {
    setProducts([]);
    setOrders([]);
    setInvestments([]);
    setExpenses([]);
    setBills([]);
    setCart([]);
    localStorage.removeItem('products_data');
    localStorage.removeItem('orders_data');
    localStorage.removeItem('investments_data');
    localStorage.removeItem('expenses_data');
    localStorage.removeItem('bills_data');
    localStorage.removeItem('cart_data');
  };

  // Customer Auth Actions
  const loginCustomer = (email: string, phone: string, name?: string) => {
    const cust: CustomerProfile = {
      id: `cust-${Date.now()}`,
      email,
      phone,
      name: name || email.split('@')[0] || 'Valued Customer',
      address: 'Green Park Road',
      area: 'Green Park',
      city: 'New Delhi',
      pincode: '110016',
    };
    setCurrentCustomer(cust);
  };

  const registerCustomer = (profileData: Omit<CustomerProfile, 'id'>): CustomerProfile => {
    const cust: CustomerProfile = {
      ...profileData,
      id: `cust-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setRegisteredCustomers((prev) => [cust, ...prev]);
    setCurrentCustomer(cust);
    return cust;
  };

  const authenticateCustomer = (
    identifier: string,
    pass: string
  ): { success: boolean; reason?: 'NOT_REGISTERED' | 'INVALID_PASSWORD'; customer?: CustomerProfile } => {
    const cleanId = identifier.trim().toLowerCase().replace(/\s+/g, '');
    const cleanPhoneDigits = identifier.replace(/\D/g, '');

    const found = registeredCustomers.find((c) => {
      const cEmail = c.email.trim().toLowerCase();
      const cPhoneDigits = c.phone.replace(/\D/g, '');
      const matchEmail = cEmail === cleanId;
      const matchPhone = cleanPhoneDigits.length >= 10 && cPhoneDigits.endsWith(cleanPhoneDigits.slice(-10));
      return matchEmail || matchPhone;
    });

    if (!found) {
      return { success: false, reason: 'NOT_REGISTERED' };
    }

    if (found.password && found.password !== pass) {
      return { success: false, reason: 'INVALID_PASSWORD' };
    }

    setCurrentCustomer(found);
    return { success: true, customer: found };
  };

  const logoutCustomer = () => {
    setCurrentCustomer(null);
  };

  const updateCustomerProfile = (fields: Partial<CustomerProfile>) => {
    if (currentCustomer) {
      setCurrentCustomer({ ...currentCustomer, ...fields });
    }
  };

  // Owner Auth Actions
  const loginOwner = () => {
    setIsOwnerLoggedIn(true);
    localStorage.setItem('owner_auth', 'true');
  };

  const logoutOwner = () => {
    setIsOwnerLoggedIn(false);
    localStorage.removeItem('owner_auth');
  };

  const updateShopSettings = (settings: Partial<ShopSettings>) => {
    setShop((prev) => ({ ...prev, ...settings }));
    updateShopSettingsInSupabase(settings);
  };

  // Product Actions
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `p-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    saveProductToSupabase(newProduct);

    if (newProduct.stock_quantity > 0) {
      const movement: StockMovement = {
        id: `sm-${Date.now()}`,
        product_id: newProduct.id,
        product_name: newProduct.name,
        quantity: newProduct.stock_quantity,
        movement_type: 'PURCHASE',
        note: 'Initial product stock created',
        created_at: new Date().toISOString(),
      };
      setStockMovements((prev) => [movement, ...prev]);
      saveStockMovementToSupabase(movement);
    }
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updatedFields, updated_at: new Date().toISOString() };
          saveProductToSupabase(updated);
          return updated;
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteProductFromSupabase(id);
  };

  const restockProduct = (id: string, qty: number, note?: string) => {
    let updatedProd: Product | undefined;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedProd = { ...p, stock_quantity: p.stock_quantity + qty };
          return updatedProd;
        }
        return p;
      })
    );
    if (updatedProd) saveProductToSupabase(updatedProd);

    const prod = products.find((p) => p.id === id);
    const movement: StockMovement = {
      id: `sm-${Date.now()}`,
      product_id: id,
      product_name: prod?.name || 'Product',
      quantity: qty,
      movement_type: 'PURCHASE',
      note: note || `Restocked ${qty} units`,
      created_at: new Date().toISOString(),
    };
    setStockMovements((prev) => [movement, ...prev]);
    saveStockMovementToSupabase(movement);
  };

  // Cart Actions
  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock_quantity <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock_quantity);
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prevCart, { product, quantity: Math.min(quantity, product.stock_quantity) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxAllowed = item.product.stock_quantity;
          return { ...item, quantity: Math.min(quantity, maxAllowed) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Dispatch Bill Notification via Server API
  const dispatchBillNotification = async (
    target: Order | Bill,
    method?: DeliveryMethod
  ): Promise<{ success: boolean; status: string; error?: string }> => {
    const isOrder = 'order_number' in target;
    const recipientPhone = isOrder ? (target as Order).customer_mobile || (target as Order).customer_phone || '' : (target as Bill).customer_mobile || '';
    const invoiceUrl = `${window.location.origin}${target.invoice_url || `/invoice/${target.invoice_token}`}`;
    const orderNo = isOrder ? (target as Order).order_number : (target as Bill).bill_number;
    const totalAmount = isOrder ? (target as Order).total_amount : (target as Bill).total;

    try {
      const res = await fetch('/api/notifications/send-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone,
          customerName: target.customer_name,
          billNumber: target.invoice_number || (!isOrder ? (target as Bill).bill_number : orderNo),
          orderNumber: orderNo,
          totalAmount,
          invoiceUrl,
          deliveryMethod: method || shop.preferred_delivery_method || 'WHATSAPP',
          shopName: shop.name,
          smsApiKey: shop.sms_api_key,
          whatsappApiKey: shop.whatsapp_api_key,
        }),
      });

      const data = await res.json();

      // Update delivery status in state
      if (isOrder) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === target.id
              ? {
                  ...o,
                  invoice_sent_at: new Date().toISOString(),
                  invoice_delivery_status: data.status === 'NOT_CONFIGURED' ? 'FAILED' : data.status || 'SENT',
                  invoice_delivery_method: method || 'WHATSAPP',
                }
              : o
          )
        );
      } else {
        setBills((prev) =>
          prev.map((b) =>
            b.id === target.id
              ? {
                  ...b,
                  invoice_sent_at: new Date().toISOString(),
                  invoice_delivery_status: data.status === 'NOT_CONFIGURED' ? 'FAILED' : data.status || 'SENT',
                  invoice_delivery_method: method || 'WHATSAPP',
                }
              : b
          )
        );
      }

      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Notification Request Failed';
      return { success: false, status: 'FAILED', error: errorMessage };
    }
  };

  // Order Actions & Automatic Invoice Token Generation
  const createOrder = (orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>): Order => {
    const orderId = `ord-${Date.now()}`;
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${randNum}`;
    const invoicePrefix = shop.invoice_prefix || 'INV-';
    const invoiceNumber = `${invoicePrefix}${randNum}`;
    const invoiceToken = `inv-tok-${Date.now()}-${randNum}`;
    const invoiceUrl = `/invoice/${invoiceToken}`;

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      order_number: orderNumber,
      customer_id: currentCustomer?.id,
      customer_mobile: orderData.customer_mobile || orderData.customer_phone,
      invoice_number: invoiceNumber,
      invoice_token: invoiceToken,
      invoice_url: invoiceUrl,
      invoice_generated_at: new Date().toISOString(),
      invoice_delivery_status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    saveOrderToSupabase(newOrder);

    // Stock deduction
    newOrder.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === item.product_id) {
            const updatedStock = Math.max(0, p.stock_quantity - item.quantity);
            return { ...p, stock_quantity: updatedStock };
          }
          return p;
        })
      );

      const movement: StockMovement = {
        id: `sm-${Date.now()}-${item.product_id}`,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: -item.quantity,
        movement_type: 'SALE',
        reference_id: orderNumber,
        note: `Customer order ${orderNumber}`,
        created_at: new Date().toISOString(),
      };
      setStockMovements((prev) => [movement, ...prev]);
    });

    clearCart();

    // Auto dispatch bill if enabled
    if (shop.auto_send_bill !== false && newOrder.customer_mobile) {
      setTimeout(() => {
        dispatchBillNotification(newOrder, shop.preferred_delivery_method);
      }, 500);
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          if (newStatus === 'Cancelled' && ord.order_status !== 'Cancelled') {
            ord.items.forEach((item) => {
              setProducts((pList) =>
                pList.map((p) => (p.id === item.product_id ? { ...p, stock_quantity: p.stock_quantity + item.quantity } : p))
              );

              const movement: StockMovement = {
                id: `sm-${Date.now()}-${item.product_id}`,
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                movement_type: 'RETURN',
                reference_id: ord.order_number,
                note: `Order ${ord.order_number} cancelled`,
                created_at: new Date().toISOString(),
              };
              setStockMovements((smPrev) => [movement, ...smPrev]);
            });
          }

          const updated = { ...ord, order_status: newStatus };
          // If confirmed or completed, auto-send invoice
          if ((newStatus === 'Confirmed' || newStatus === 'Delivered') && ord.customer_mobile) {
            setTimeout(() => {
              dispatchBillNotification(updated, shop.preferred_delivery_method);
            }, 300);
          }
          return updated;
        }
        return ord;
      })
    );
  };

  // Financial & POS Actions
  const addInvestment = (inv: Omit<Investment, 'id'>) => {
    const newInv: Investment = {
      ...inv,
      id: `inv-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setInvestments((prev) => [newInv, ...prev]);
    saveInvestmentToSupabase(newInv);
  };

  const addExpense = (exp: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...exp,
      id: `exp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
    saveExpenseToSupabase(newExp);
  };

  const createBill = (
    billData: Omit<Bill, 'id' | 'bill_number' | 'created_at' | 'invoice_number' | 'invoice_url' | 'invoice_token' | 'invoice_generated_at' | 'invoice_delivery_status'>
  ): Bill => {
    const billId = `bill-${Date.now()}`;
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const invoicePrefix = shop.invoice_prefix || 'INV-';
    const invoiceNumber = `${invoicePrefix}${randNum}`;
    const invoiceToken = `inv-tok-bill-${Date.now()}-${randNum}`;
    const invoiceUrl = `/invoice/${invoiceToken}`;

    const newBill: Bill = {
      ...billData,
      id: billId,
      bill_number: invoiceNumber,
      customer_mobile: billData.customer_mobile || billData.customer_phone || '',
      invoice_number: invoiceNumber,
      invoice_token: invoiceToken,
      invoice_url: invoiceUrl,
      invoice_generated_at: new Date().toISOString(),
      invoice_delivery_status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    setBills((prev) => [newBill, ...prev]);
    saveBillToSupabase(newBill);

    newBill.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === item.product_id ? { ...p, stock_quantity: Math.max(0, p.stock_quantity - item.quantity) } : p))
      );

      const movement: StockMovement = {
        id: `sm-${Date.now()}-${item.product_id}`,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: -item.quantity,
        movement_type: 'SALE',
        reference_id: invoiceNumber,
        note: `POS Counter Bill ${invoiceNumber}`,
        created_at: new Date().toISOString(),
      };
      setStockMovements((prev) => [movement, ...prev]);
    });

    if (shop.auto_send_bill !== false && newBill.customer_mobile) {
      setTimeout(() => {
        dispatchBillNotification(newBill, shop.preferred_delivery_method);
      }, 500);
    }

    return newBill;
  };

  // Financial Metrics Computations
  const validOrders = orders.filter((o) => o.order_status !== 'Cancelled');
  const orderSalesTotal = validOrders.reduce((acc, o) => acc + o.total_amount, 0);
  const billSalesTotal = bills.reduce((acc, b) => acc + b.total, 0);
  const totalSales = orderSalesTotal + billSalesTotal;

  const totalInvestments = investments.reduce((acc, i) => acc + i.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  const orderCOGS = validOrders.reduce(
    (acc, o) => acc + o.items.reduce((iAcc, item) => iAcc + item.purchase_price * item.quantity, 0),
    0
  );
  const billCOGS = bills.reduce(
    (acc, b) => acc + b.items.reduce((iAcc, item) => iAcc + item.purchase_price * item.quantity, 0),
    0
  );
  const totalProductCostOfSales = orderCOGS + billCOGS;

  const grossProfit = totalSales - totalProductCostOfSales;
  const netProfit = grossProfit - totalExpenses;

  const lowStockProducts = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_limit);
  const outOfStockProducts = products.filter((p) => p.stock_quantity <= 0);

  return (
    <DataContext.Provider
      value={{
        shop,
        categories,
        products,
        cart,
        orders,
        investments,
        expenses,
        bills,
        stockMovements,
        isOwnerLoggedIn,
        isLoaded,
        registeredCustomers,
        currentCustomer,
        loginCustomer,
        registerCustomer,
        authenticateCustomer,
        logoutCustomer,
        updateCustomerProfile,
        loginOwner,
        logoutOwner,
        updateShopSettings,
        clearAllDemoData,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createOrder,
        updateOrderStatus,
        dispatchBillNotification,
        addInvestment,
        addExpense,
        createBill,
        totalSales,
        totalInvestments,
        totalExpenses,
        totalProductCostOfSales,
        grossProfit,
        netProfit,
        lowStockProducts,
        outOfStockProducts,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
