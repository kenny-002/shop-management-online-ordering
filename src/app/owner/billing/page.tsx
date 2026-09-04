'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import {
  Receipt,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  QrCode,
  Send,
  Smartphone,
  CheckCircle2,
  Loader2,
  History,
  AlertTriangle,
  ExternalLink,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import { useData } from '@/context/data-context';
import { Product, BillItem, Bill, DeliveryMethod } from '@/lib/types';

export default function OwnerBillingPage() {
  const { shop, products, bills, createBill, dispatchBillNotification } = useData();

  const [activeTab, setActiveTab] = useState<'terminal' | 'history'>('terminal');

  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [billCart, setBillCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Other'>('Cash');

  const [generatedInvoice, setGeneratedInvoice] = useState<Bill | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Dispatch States
  const [isSending, setIsSending] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{
    success: boolean;
    status: string;
    message?: string;
    error?: string;
  } | null>(null);

  const filteredProducts = products.filter(
    (p) => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToBillCart = (prod: Product) => {
    if (prod.stock_quantity <= 0) return;
    setBillCart((prev) => {
      const existing = prev.find((item) => item.product.id === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === prod.id
            ? { ...item, quantity: Math.min(item.quantity + 1, prod.stock_quantity) }
            : item
        );
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
  };

  const updateBillQty = (prodId: string, qty: number) => {
    if (qty <= 0) {
      setBillCart((prev) => prev.filter((item) => item.product.id !== prodId));
      return;
    }
    setBillCart((prev) =>
      prev.map((item) => (item.product.id === prodId ? { ...item, quantity: qty } : item))
    );
  };

  const removeFromBillCart = (prodId: string) => {
    setBillCart((prev) => prev.filter((item) => item.product.id !== prodId));
  };

  const subtotal = billCart.reduce((acc, item) => acc + item.product.selling_price * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - discount + deliveryCharge);

  // Validate Indian Mobile Phone Format
  const validatePhone = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (!clean) return 'Customer mobile number is required.';
    if (clean.length === 10 && /^[6-9]\d{9}$/.test(clean)) return '';
    if (clean.length === 12 && clean.startsWith('91')) return '';
    return 'Please enter a valid 10-digit Indian mobile number (e.g. +91 9876543210).';
  };

  // Direct 1-Click WhatsApp Message Dispatch with Complete Itemized Receipt Text
  const handleManualWhatsApp = (billObj: Bill) => {
    const phone = billObj.customer_mobile || customerPhone || '';
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const invoiceUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${billObj.invoice_url || `/invoice/${billObj.invoice_token}`}`
      : '';

    const items = billObj.items || [];
    let itemsText = '';
    if (items.length > 0) {
      itemsText = items
        .map((it) => `• *${it.product_name}* x ${it.quantity} — ₹${it.subtotal}`)
        .join('\n');
    } else {
      itemsText = `• Counter Purchase — ₹${billObj.total}`;
    }

    const dateStr = new Date(billObj.created_at || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const messageText = `🧾 *DIGITAL RECEIPT - ${shop.name.toUpperCase()}*
----------------------------------------
*Invoice No:* #${billObj.invoice_number || billObj.bill_number}
*Date:* ${dateStr}
*Customer:* ${billObj.customer_name}
----------------------------------------
*ITEMS PURCHASED:*
${itemsText}
----------------------------------------
*Subtotal:* ₹${billObj.subtotal}${billObj.discount > 0 ? `\n*Discount:* -₹${billObj.discount}` : ''}
*GRAND TOTAL:* ₹${billObj.total}
*Payment:* ${billObj.payment_method} (Paid)
----------------------------------------
📄 *View & Download Digital Invoice:*
${invoiceUrl}

Thank you for shopping with us! 🙏`;

    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`
      : `https://wa.me/?text=${encodeURIComponent(messageText)}`;

    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    }

    setDispatchResult({
      success: true,
      status: 'SENT',
      message: `📱 Complete itemized bill sent to WhatsApp Web for +${cleanPhone || 'customer'}!`,
    });
  };

  // Export Invoice Card as High-Res PNG Image File
  const handleDownloadBillImage = async (elementId: string, filename: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to export bill image:', err);
    }
  };

  // Dispatch Bill via Server API
  const handleApiDispatch = async (billObj: Bill, method: DeliveryMethod) => {
    setIsSending(true);
    setDispatchResult(null);

    const res = await dispatchBillNotification(billObj, method);
    setIsSending(false);

    if (res.status === 'NOT_CONFIGURED') {
      setDispatchResult({
        success: false,
        status: 'NOT_CONFIGURED',
        error: 'Mobile bill delivery is not configured. Please configure WhatsApp/SMS in Settings.',
      });
    } else if (res.success) {
      setDispatchResult({
        success: true,
        status: res.status,
        message: `✅ Bill sent successfully to customer (${billObj.customer_mobile || customerPhone}).`,
      });
    } else {
      // If API dispatch fails (e.g. Fast2SMS error), offer manual WhatsApp opening automatically
      handleManualWhatsApp(billObj);
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (billCart.length === 0) return;

    // Validate phone number if entered
    if (customerPhone.trim()) {
      const err = validatePhone(customerPhone);
      if (err) {
        setPhoneError(err);
        return;
      }
    }
    setPhoneError('');

    const items: BillItem[] = billCart.map((item) => ({
      id: `bi-${Date.now()}-${item.product.id}`,
      bill_id: '',
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      purchase_price: item.product.purchase_price,
      selling_price: item.product.selling_price,
      subtotal: item.product.selling_price * item.quantity,
    }));

    const bill = createBill({
      customer_name: customerName || 'Walk-in Customer',
      customer_phone: customerPhone || undefined,
      customer_mobile: customerPhone || '',
      subtotal,
      discount,
      delivery_charge: deliveryCharge,
      total: grandTotal,
      payment_method: paymentMethod,
      items,
    });

    setGeneratedInvoice(bill);
    setBillCart([]);

    // Trigger direct manual WhatsApp message dispatch if customer phone is entered
    if (customerPhone.trim()) {
      handleManualWhatsApp(bill);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Point of Sale (POS) Billing Terminal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tap items to create counter invoices (`INV-1001`) and send digital bills directly to customer mobile numbers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'terminal' ? 'bg-emerald-600 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              POS Terminal
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'history' ? 'bg-emerald-600 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Bill History
            </button>
          </div>

          <button
            onClick={() => setShowQRModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" /> Store UPI QR
          </button>
        </div>
      </div>

      {/* DISPATCH STATUS ALERTS */}
      {isSending && (
        <div className="bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/50 p-4 rounded-2xl text-xs font-bold text-emerald-300 flex items-center gap-3 animate-pulse shadow-lg">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Sending digital bill to customer mobile (+91 {customerPhone})...</span>
        </div>
      )}

      {dispatchResult && !isSending && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xl ${
            dispatchResult.success
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
              : dispatchResult.status === 'NOT_CONFIGURED'
              ? 'bg-amber-950/80 border border-amber-500/50 text-amber-300'
              : 'bg-red-950/80 border border-red-500/50 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {dispatchResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span>{dispatchResult.message || dispatchResult.error}</span>
          </div>

          {dispatchResult.status === 'NOT_CONFIGURED' && (
            <Link
              href="/owner/settings"
              className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl font-black text-xs hover:bg-amber-400 transition-colors shrink-0"
            >
              Configure Settings →
            </Link>
          )}
        </div>
      )}

      {/* TAB 1: POS TERMINAL */}
      {activeTab === 'terminal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Product Selection Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products for quick counter billing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-400 text-xs rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto p-1 scrollbar-none">
              {filteredProducts.map((prod) => {
                const isOut = prod.stock_quantity <= 0;
                return (
                  <button
                    key={prod.id}
                    onClick={() => addToBillCart(prod)}
                    disabled={isOut}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      isOut
                        ? 'bg-slate-950 border-slate-900 text-slate-600 opacity-50 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-emerald-500/50 text-white shadow-md'
                    }`}
                  >
                    <img src={prod.image_url} alt={prod.name} className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs truncate">{prod.name}</h4>
                      <p className="text-xs text-emerald-400 font-extrabold mt-0.5">₹{prod.selling_price}</p>
                      <span className="text-[10px] text-slate-400">{prod.stock_quantity} left</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Billing Counter Summary & Invoice Generation */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl sticky top-24">
            <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" /> Current Bill Cart ({billCart.length})
            </h3>

            {/* Customer Inputs with Indian Phone Validation */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="Walk-in Customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] text-emerald-400 font-bold block mb-1 flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-emerald-400" /> Customer Mobile *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                  className={`w-full bg-slate-950 border text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 font-bold text-emerald-400 ${
                    phoneError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-emerald-500'
                  }`}
                />
              </div>
            </div>

            {phoneError && <p className="text-[10px] text-red-400 font-bold">{phoneError}</p>}

            {/* Cart Itemized List */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {billCart.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Tap products on the left to add items to bill.</p>
              ) : (
                billCart.map(({ product, quantity }) => (
                  <div key={product.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold text-white truncate">{product.name}</p>
                      <span className="text-[10px] text-slate-400">₹{product.selling_price} each</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg">
                        <button onClick={() => updateBillQty(product.id, quantity - 1)} className="px-1.5 py-0.5 text-white font-bold">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold text-emerald-400">{quantity}</span>
                        <button onClick={() => updateBillQty(product.id, quantity + 1)} className="px-1.5 py-0.5 text-white font-bold">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-white min-w-[45px] text-right">₹{product.selling_price * quantity}</span>
                      <button onClick={() => removeFromBillCart(product.id)} className="text-slate-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Price Adjustments */}
            <div className="space-y-2 border-t border-slate-800 pt-3 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Subtotal</span>
                <span className="font-bold text-white">₹{subtotal}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-20 bg-slate-950 border border-slate-700 text-right text-white rounded-lg px-2 py-1 text-xs"
                />
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Delivery Fee (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                  className="w-20 bg-slate-950 border border-slate-700 text-right text-white rounded-lg px-2 py-1 text-xs"
                />
              </div>

              <div className="flex justify-between items-center text-slate-300 pt-1">
                <span>Payment Method</span>
                <select
                  value={paymentMethod}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaymentMethod(e.target.value as 'Cash' | 'UPI' | 'Card' | 'Other')}
                  className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI QR</option>
                  <option value="Card">Credit/Debit Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline">
                <span className="font-extrabold text-white text-base">Grand Total</span>
                <span className="font-black text-2xl text-emerald-400">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={handleGenerateInvoice}
              disabled={billCart.length === 0 || isSending}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-xs transition-all hover:scale-102 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending Bill to Customer...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Generate & Automatically Send Digital Bill
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: BILL HISTORY TABLE */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" /> POS Bill History & Delivery Status
            </h3>
            <span className="text-xs text-slate-400">{bills.length} Bills Generated</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Invoice No</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Mobile Number</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Delivery Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500">
                      No bills generated yet. Use the POS Terminal to create invoices.
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-extrabold text-emerald-400">{bill.invoice_number || bill.bill_number}</td>
                      <td className="py-3 px-4 font-bold text-white">{bill.customer_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{bill.customer_mobile || bill.customer_phone || 'N/A'}</td>
                      <td className="py-3 px-4 text-right font-black text-white">₹{bill.total}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          {bill.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{new Date(bill.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            bill.invoice_delivery_status === 'DELIVERED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : bill.invoice_delivery_status === 'SENT'
                              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                              : bill.invoice_delivery_status === 'FAILED'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {bill.invoice_delivery_status || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={bill.invoice_url || `/invoice/${bill.invoice_token}`}
                            target="_blank"
                            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 p-1.5 rounded-lg border border-slate-700"
                            title="View Secure Digital Bill"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleManualWhatsApp(bill)}
                            className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/30"
                            title="Send Digital Invoice via WhatsApp Web"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GENERATED INVOICE PREVIEW MODAL */}
      {generatedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div id="pos-invoice-receipt-card" className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] print:p-0 print:shadow-none font-mono">
            {/* Header */}
            <div className="text-center border-b border-slate-300 pb-4 space-y-1">
              <h2 className="text-2xl font-black tracking-tight">{shop.name}</h2>
              <p className="text-xs text-slate-600">{shop.address}</p>
              <p className="text-xs text-slate-600">Phone: {shop.phone}</p>
            </div>

            {/* Bill Details */}
            <div className="flex justify-between text-xs border-b border-slate-300 pb-3">
              <div>
                <p><strong>Invoice No:</strong> {generatedInvoice.invoice_number}</p>
                <p><strong>Date:</strong> {new Date(generatedInvoice.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p><strong>Customer:</strong> {generatedInvoice.customer_name}</p>
                <p><strong>Mobile No:</strong> {generatedInvoice.customer_mobile || customerPhone || 'N/A'}</p>
                <p><strong>Payment:</strong> {generatedInvoice.payment_method}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border-b border-slate-300 pb-4">
              <thead>
                <tr className="border-b border-slate-300 text-slate-700">
                  <th className="py-2">Product</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {generatedInvoice.items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-2 font-bold">{it.product_name}</td>
                    <td className="py-2 text-center">{it.quantity}</td>
                    <td className="py-2 text-right">₹{it.selling_price}</td>
                    <td className="py-2 text-right font-bold">₹{it.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div className="space-y-1 text-xs text-right border-b border-slate-300 pb-4">
              <p>Subtotal: <strong>₹{generatedInvoice.subtotal}</strong></p>
              <p>Discount: <strong>-₹{generatedInvoice.discount}</strong></p>
              <p>Delivery: <strong>+₹{generatedInvoice.delivery_charge}</strong></p>
              <p className="text-base font-black pt-1">TOTAL: ₹{generatedInvoice.total}</p>
            </div>

            {/* Footer Notice */}
            <div className="text-center text-xs space-y-1 text-slate-600">
              <p className="font-bold">Thank you for shopping with us!</p>
              <p className="text-[10px]">Visit again at {shop.name}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 print:hidden pt-4 border-t font-sans">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleManualWhatsApp(generatedInvoice)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <Send className="w-4 h-4" /> 💬 Send via WhatsApp Web
                </button>
                <button
                  onClick={() => handleDownloadBillImage('pos-invoice-receipt-card', `Bill_${generatedInvoice.invoice_number || generatedInvoice.bill_number}.png`)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <ImageIcon className="w-4 h-4" /> 🖼️ Save Bill Image (PNG)
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Bill
                </button>
                <Link
                  href={generatedInvoice.invoice_url || `/invoice/${generatedInvoice.invoice_token}`}
                  target="_blank"
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border text-center"
                >
                  <Download className="w-3.5 h-3.5" /> Digital PDF
                </Link>
                <button
                  onClick={() => setGeneratedInvoice(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPI QR COUNTER MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-white">Store Counter UPI QR Code</h3>
            <div className="bg-white p-3 rounded-2xl w-48 h-48 mx-auto shadow-inner flex items-center justify-center">
              <img src={shop.qr_code_url} alt="Shop QR Code" className="w-full h-full object-contain" />
            </div>
            <p className="text-xs text-emerald-400 font-extrabold font-mono">{shop.upi_id}</p>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs"
            >
              Close QR Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
