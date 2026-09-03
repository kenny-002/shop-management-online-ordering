'use client';

import React, { useState } from 'react';
import { Search, Phone } from 'lucide-react';
import { useData } from '@/context/data-context';
import { OrderStatus } from '@/lib/types';

export default function OwnerOrdersPage() {
  const { orders, updateOrderStatus } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const statuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Preparing',
    'Ready',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  const filteredOrders = orders.filter((o) => {
    const matchQuery =
      !searchQuery.trim() ||
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_phone.includes(searchQuery.trim());
    const matchStatus = statusFilter === 'ALL' || o.order_status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Order Management Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">Review incoming online customer orders, update delivery progress, and handle cancellations.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by Order #, Customer Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-700 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            statusFilter === 'ALL' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          All Orders ({orders.length})
        </button>
        {statuses.map((st) => {
          const count = orders.filter((o) => o.order_status === st).length;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950/50">
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Items Ordered</th>
                <th className="py-3.5 px-4">Amount & Payment</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4 text-right">Update Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-emerald-400 text-sm block">{ord.order_number}</span>
                      <span className="text-[10px] text-slate-400">{new Date(ord.created_at).toLocaleString()}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{ord.customer_name}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-400" /> {ord.customer_phone}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="max-w-xs space-y-0.5">
                        {ord.items.map((it) => (
                          <p key={it.id} className="text-slate-300 text-[11px] truncate">
                            {it.product_name} <strong className="text-white">x{it.quantity}</strong>
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-black text-white text-sm">₹{ord.total_amount}</p>
                      <span className="text-[10px] text-emerald-400 font-semibold">{ord.payment_method} ({ord.payment_status})</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-semibold">{ord.delivery_type}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          ord.order_status === 'Delivered'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : ord.order_status === 'Cancelled'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {ord.order_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={ord.order_status}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="bg-slate-950 border border-slate-700 text-slate-100 font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
                      >
                        {statuses.map((st) => (
                          <option key={st} value={st} className="bg-slate-900">
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
