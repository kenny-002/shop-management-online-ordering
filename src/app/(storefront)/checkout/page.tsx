'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QrCode, Home, Store, Check, ArrowRight, ShieldCheck, Phone, MapPin, Truck } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, shop, createOrder } = useData();

  const [deliveryType, setDeliveryType] = useState<'Home Delivery' | 'Shop Pickup'>('Home Delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Delivery Address Fields
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('Sector 4, Green Park');
  const [city, setCity] = useState('New Delhi');
  const [pincode, setPincode] = useState('110016');
  const [instructions, setInstructions] = useState('');

  // Payment Details
  const [paymentRef, setPaymentRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + item.product.selling_price * item.quantity, 0);
  const deliveryCharge = deliveryType === 'Home Delivery' ? shop.delivery_charge : 0;
  const totalAmount = subtotal + deliveryCharge;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400">Please add items to your cart before proceeding to checkout.</p>
        <Link href="/products" className="inline-block bg-emerald-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs">
          Browse Products
        </Link>
      </div>
    );
  }

  const validateIndianPhone = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (!clean) return 'Customer mobile number is mandatory.';
    if (clean.length === 10 && /^[6-9]\d{9}$/.test(clean)) return '';
    if (clean.length === 12 && clean.startsWith('91')) return '';
    return 'Please enter a valid 10-digit Indian mobile number (e.g. +91 9876543210).';
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const phoneErr = validateIndianPhone(customerPhone);
    if (phoneErr) {
      setErrorMsg(phoneErr);
      return;
    }

    if (deliveryType === 'Home Delivery' && (!address.trim() || !pincode.trim())) {
      setErrorMsg('Please enter complete delivery address details.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = cart.map((item) => ({
        id: `oi-${Date.now()}-${item.product.id}`,
        order_id: '',
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        purchase_price: item.product.purchase_price,
        selling_price: item.product.selling_price,
        subtotal: item.product.selling_price * item.quantity,
      }));

      const created = createOrder({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_mobile: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        subtotal,
        discount: 0,
        delivery_charge: deliveryCharge,
        total_amount: totalAmount,
        payment_method: 'UPI',
        payment_status: 'Paid',
        payment_ref: paymentRef.trim() || `UPI-TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        delivery_type: deliveryType,
        delivery_address:
          deliveryType === 'Home Delivery'
            ? { address, area, city, pincode, instructions }
            : undefined,
        order_status: 'Pending',
        items: orderItems,
      });

      router.push(`/orders/confirmation/${created.id}`);
    } catch {
      setErrorMsg('Order creation failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Checkout & Order Payment</h1>
        <p className="text-xs text-slate-400 mt-1">Provide your delivery information and scan the shop&apos;s UPI QR code to complete payment.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Delivery Details & Order Type */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Type Toggle */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-extrabold text-base text-white">1. Select Order Type</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDeliveryType('Home Delivery')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  deliveryType === 'Home Delivery'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl ${deliveryType === 'Home Delivery' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}>
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Home Delivery</h4>
                  <p className="text-xs opacity-75 mt-0.5">Delivered to doorstep (+₹{shop.delivery_charge})</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('Shop Pickup')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  deliveryType === 'Shop Pickup'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl ${deliveryType === 'Shop Pickup' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}>
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Shop Pickup</h4>
                  <p className="text-xs opacity-75 mt-0.5">Pick up at store (FREE)</p>
                </div>
              </button>
            </div>
          </div>

          {/* Customer Details & Address Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-extrabold text-base text-white">2. Customer Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-400 block mb-1">Mobile Phone Number (Mandatory) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-bold rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Digital invoice link will be sent to this mobile.</span>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {deliveryType === 'Home Delivery' ? (
              <div className="border-t border-slate-800 pt-4 space-y-4">
                <h4 className="font-bold text-sm text-slate-200">Delivery Address</h4>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">House / Flat / Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="House #123, 2nd Floor, Main Street"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Area / Locality</label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Delivery Instructions (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Leave near security gate / Call on arrival"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-800 pt-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <p className="font-bold text-white">Pickup Location:</p>
                <p className="flex items-center gap-1 text-emerald-400">
                  <MapPin className="w-3.5 h-3.5" /> {shop.name}
                </p>
                <p>{shop.address}</p>
                <p className="text-slate-400 pt-1">Pickup Hours: {shop.opening_hours}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: UPI QR Code Payment Card & Total */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl sticky top-24">
          <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3">3. Scan & Pay via UPI</h3>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center space-y-3">
            <div className="bg-white p-3 rounded-2xl w-48 h-48 mx-auto shadow-inner border flex items-center justify-center">
              <img src={shop.qr_code_url} alt="Shop UPI QR Code" className="w-full h-full object-contain" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block">Shop Official UPI ID</span>
              <code className="text-sm font-extrabold text-emerald-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 block w-fit mx-auto">
                {shop.upi_id}
              </code>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 block">Amount Payable</span>
              <p className="text-3xl font-black text-white">₹{totalAmount}</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              UPI Transaction / UTR Ref ID (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 984329104829"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm transition-all hover:scale-102"
          >
            {isSubmitting ? (
              'Processing Order...'
            ) : (
              <>
                <Check className="w-5 h-5" /> I Have Paid ₹{totalAmount}
              </>
            )}
          </button>

          <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure payment directly verified by shop owner
          </p>
        </div>
      </form>
    </div>
  );
}
