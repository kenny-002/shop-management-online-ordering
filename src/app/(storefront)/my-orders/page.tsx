'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Package, Search, Clock, ArrowRight, FileText, Download } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function MyOrdersPage() {
  const { orders } = useData();
  const [searchPhone, setSearchPhone] = useState('');

  const filteredOrders = orders.filter((o) => {
    if (!searchPhone.trim()) return true;
    return (
      o.customer_phone.includes(searchPhone.trim()) ||
      (o.customer_mobile && o.customer_mobile.includes(searchPhone.trim())) ||
      o.order_number.toLowerCase().includes(searchPhone.trim().toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Track My Orders</h1>
          <p className="text-xs text-slate-400 mt-1">View past purchases, check status updates, and download digital invoices</p>
        </div>

        {/* Quick Phone Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by Phone or Order #..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-3">
          <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Orders Found</h3>
          <p className="text-xs text-slate-400">We couldn't find any orders matching your phone or order number search.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const invoiceUrl = ord.invoice_url || `/invoice/${ord.invoice_token || ord.id}`;
            return (
              <div
                key={ord.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-emerald-400 text-base">{ord.order_number}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        ord.order_status === 'Delivered'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : ord.order_status === 'Cancelled'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {ord.order_status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    <strong className="text-white">{ord.items.length} Items:</strong>{' '}
                    {ord.items.map((i) => `${i.product_name} (x${i.quantity})`).join(', ')}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1" suppressHydrationWarning>
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> {new Date(ord.created_at).toLocaleDateString()}
                    </span>
                    <span>
                      Payment: <strong className="text-slate-200">{ord.payment_method} ({ord.payment_status})</strong>
                    </span>
                    <span>Type: <strong className="text-slate-200">{ord.delivery_type}</strong></span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                  <div className="text-right pr-2">
                    <span className="text-[10px] text-slate-400 block">Total Amount</span>
                    <span className="text-xl font-black text-white">₹{ord.total_amount}</span>
                  </div>

                  {/* VIEW BILL & DOWNLOAD INVOICE BUTTONS */}
                  <Link
                    href={invoiceUrl}
                    target="_blank"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" /> View Bill
                  </Link>

                  <Link
                    href={invoiceUrl}
                    target="_blank"
                    className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Invoice
                  </Link>

                  <Link
                    href={`/orders/confirmation/${ord.id}`}
                    className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors"
                  >
                    Track Order <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
