'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Package, LogOut, Save, Check } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function CustomerAccountPage() {
  const router = useRouter();
  const { currentCustomer, logoutCustomer, updateCustomerProfile, orders } = useData();

  // ALWAYS call all useState hooks unconditionally at top level
  const [name, setName] = useState(currentCustomer?.name || '');
  const [phone, setPhone] = useState(currentCustomer?.phone || '');
  const [email, setEmail] = useState(currentCustomer?.email || '');
  const [address, setAddress] = useState(currentCustomer?.address || '');
  const [area, setArea] = useState(currentCustomer?.area || 'Sector 4');
  const [pincode, setPincode] = useState(currentCustomer?.pincode || '110016');
  const [savedNotice, setSavedNotice] = useState(false);

  // Sync state when currentCustomer changes
  useEffect(() => {
    if (currentCustomer) {
      setName(currentCustomer.name || '');
      setPhone(currentCustomer.phone || '');
      setEmail(currentCustomer.email || '');
      setAddress(currentCustomer.address || '');
      setArea(currentCustomer.area || 'Sector 4');
      setPincode(currentCustomer.pincode || '110016');
    }
  }, [currentCustomer]);

  // If not logged in, render fallback AFTER all hooks have executed
  if (!currentCustomer) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Not Logged In</h2>
        <p className="text-xs text-slate-400">Please log in to view your customer profile and saved delivery addresses.</p>
        <Link href="/login" className="inline-block bg-emerald-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs">
          Go to Customer Login
        </Link>
      </div>
    );
  }

  const customerOrders = orders.filter(
    (o) => o.customer_phone === currentCustomer.phone || o.customer_email === currentCustomer.email
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({ name, phone, email, address, area, pincode });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleLogout = () => {
    logoutCustomer();
    router.push('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xl">
            {currentCustomer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{currentCustomer.name}</h1>
            <p className="text-xs text-slate-400">{currentCustomer.email} • {currentCustomer.phone}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Customer Logout
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Edit Profile & Address Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" /> Customer Profile & Delivery Address
            </h3>
            {savedNotice && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Mobile Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-300 block mb-1">Default Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Area / Locality</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" /> Save Profile Details
            </button>
          </form>
        </div>

        {/* Right Column: Recent Orders Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" /> My Orders ({customerOrders.length})
            </h3>
            <Link href="/my-orders" className="text-xs text-emerald-400 font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {customerOrders.slice(0, 3).map((ord) => (
              <div key={ord.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span className="text-emerald-400 font-mono">{ord.order_number}</span>
                  <span>₹{ord.total_amount}</span>
                </div>
                <p className="text-[10px] text-slate-400">{ord.items.length} items • Status: {ord.order_status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
