'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QrCode, Home, Store, Check, ArrowRight, ArrowLeft, ShieldCheck, MapPin, Banknote, ShoppingBag } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, shop, createOrder } = useData();

  // Step 1: DETAILS, Step 2: PAYMENT
  const [currentStep, setCurrentStep] = useState<'DETAILS' | 'PAYMENT'>('DETAILS');

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

  // Payment Selection State ('Cash' vs 'UPI')
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI'>('Cash');
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
        <Link href="/products" className="inline-block bg-emerald-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs">
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

  const handleProceedToPayment = (e: React.FormEvent) => {
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

    // Advance to Payment Selection Step
    setCurrentStep('PAYMENT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
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
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'UPI' ? 'Paid' : 'Pending',
        payment_ref: paymentMethod === 'UPI' ? paymentRef.trim() || `UPI-TXN-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
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
      {/* Header & Step Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            {currentStep === 'DETAILS' ? 'Checkout & Shipping Info' : 'Select Payment Method'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {currentStep === 'DETAILS'
              ? 'Enter your delivery address and contact details to proceed.'
              : 'Choose Cash on Delivery or Pay Online via UPI QR Code.'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl text-xs w-fit">
          <div className={`px-3 py-1.5 rounded-xl font-bold ${currentStep === 'DETAILS' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
            1. Details
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <div className={`px-3 py-1.5 rounded-xl font-bold ${currentStep === 'PAYMENT' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
            2. Payment
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* STEP 1: DELIVERY & CUSTOMER DETAILS */}
      {currentStep === 'DETAILS' && (
        <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
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

          {/* Right Column: Order Summary Card with Proceed to Payment Button */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl sticky top-24">
            <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" /> Order Summary
            </h3>

            {/* Cart Items List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <img src={item.product.image_url} alt={item.product.name} className="w-9 h-9 rounded-lg object-cover bg-slate-950 border border-slate-800" />
                    <div>
                      <p className="font-bold text-white line-clamp-1">{item.product.name}</p>
                      <span className="text-[10px] text-slate-400">Qty: {item.quantity} x ₹{item.product.selling_price}</span>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-400">₹{item.product.selling_price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span className="text-white font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge</span>
                <span className="text-emerald-400 font-semibold">{deliveryCharge > 0 ? `+₹${deliveryCharge}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                <span>Total Amount</span>
                <span className="text-emerald-400">₹{totalAmount}</span>
              </div>
            </div>

            {/* PROCEED TO PAYMENT BUTTON */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm transition-all hover:scale-102"
            >
              Proceed to Payment <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure checkout & 100% verified shop
            </p>
          </div>
        </form>
      )}

      {/* STEP 2: PAYMENT METHOD SELECTION (COD vs UPI QR CODE) */}
      {currentStep === 'PAYMENT' && (
        <form onSubmit={handleFinalOrderSubmit} className="max-w-3xl mx-auto space-y-6">
          <button
            type="button"
            onClick={() => setCurrentStep('DETAILS')}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Delivery Details
          </button>

          {/* Payment Method Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <h3 className="font-extrabold text-lg text-white">Select Payment Method</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all ${
                  paymentMethod === 'Cash'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-3 rounded-2xl ${paymentMethod === 'Cash' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base">Cash on Delivery (COD)</h4>
                  <p className="text-xs opacity-80 mt-1">Pay in cash when order is delivered to your doorstep or collected at shop.</p>
                  {paymentMethod === 'Cash' && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-extrabold mt-2 bg-emerald-500/20 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                      <Check className="w-3 h-3" /> Selected
                    </span>
                  )}
                </div>
              </button>

              {/* Option 2: Pay via UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all ${
                  paymentMethod === 'UPI'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-3 rounded-2xl ${paymentMethod === 'UPI' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base">Pay via UPI QR Code</h4>
                  <p className="text-xs opacity-80 mt-1">Scan QR code using GPay, PhonePe, Paytm, or any UPI payment app.</p>
                  {paymentMethod === 'UPI' && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-extrabold mt-2 bg-emerald-500/20 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                      <Check className="w-3 h-3" /> Selected
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* IF UPI IS SELECTED: SHOW QR SCANNER & UTR ENTRY */}
            {paymentMethod === 'UPI' && (
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-6 text-center animate-fade-in">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-white">Scan & Pay ₹{totalAmount} via Any UPI App</h4>
                  <p className="text-xs text-slate-400">Open GPay, PhonePe, Paytm, or BHIM to scan official shop QR code.</p>
                </div>

                <div className="bg-white p-3 rounded-2xl w-52 h-52 mx-auto shadow-inner border flex items-center justify-center">
                  <img src={shop.qr_code_url} alt="Shop UPI QR Code" className="w-full h-full object-contain" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 block">Shop Official UPI ID</span>
                  <code className="text-sm font-extrabold text-emerald-400 bg-slate-900 px-4 py-1.5 rounded-xl border border-slate-800 block w-fit mx-auto">
                    {shop.upi_id}
                  </code>
                </div>

                <div className="text-left max-w-md mx-auto space-y-2 pt-2 border-t border-slate-900">
                  <label className="text-xs font-semibold text-slate-300 block">
                    UPI Transaction / UTR Ref ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 984329104829"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* ORDER TOTAL SUMMARY & SUBMIT BUTTON */}
            <div className="border-t border-slate-800 pt-6 space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400">Total Payable Amount</span>
                  <p className="text-2xl font-black text-emerald-400">₹{totalAmount}</p>
                </div>
                <span className="text-xs font-bold text-slate-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  Method: {paymentMethod === 'Cash' ? 'Cash on Delivery' : 'Online UPI'}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-base transition-all hover:scale-102"
              >
                {isSubmitting ? (
                  'Processing Order...'
                ) : paymentMethod === 'Cash' ? (
                  <>
                    <Check className="w-5 h-5" /> Place Order with Cash on Delivery (₹{totalAmount})
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" /> I Have Paid ₹{totalAmount} — Complete Order
                  </>
                )}
              </button>

              <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% verified & secure store order processing
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
