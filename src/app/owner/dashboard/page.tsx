'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  PiggyBank,
  Wallet,
  PieChart,
  Package,
  AlertTriangle,
  ShoppingBag,
  CheckCircle2,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useData } from '@/context/data-context';

export default function OwnerDashboardPage() {
  const {
    shop,
    products,
    orders,
    bills,
    expenses,
    totalSales,
    totalInvestments,
    totalExpenses,
    grossProfit,
    netProfit,
    lowStockProducts,
    restockProduct,
  } = useData();

  const pendingOrders = orders.filter((o) => o.order_status === 'Pending');
  const deliveredOrders = orders.filter((o) => o.order_status === 'Delivered');

  // Compute real 6-day + Today Sales & Profit breakdown based on actual timestamps
  const chartData = React.useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const isToday = i === 0;
      const dayLabel = isToday ? 'Today' : `Day ${6 - i}`;

      const isSameCalendarDay = (dateString?: string) => {
        if (!dateString) return false;
        const itemDate = new Date(dateString);
        return (
          itemDate.getFullYear() === d.getFullYear() &&
          itemDate.getMonth() === d.getMonth() &&
          itemDate.getDate() === d.getDate()
        );
      };

      const dayOrders = orders.filter((o) => o.order_status !== 'Cancelled' && isSameCalendarDay(o.created_at));
      const dayBills = bills.filter((b) => isSameCalendarDay(b.created_at));
      const dayExpenses = expenses.filter((e) => isSameCalendarDay(e.created_at));

      const orderSales = dayOrders.reduce((sum, o) => sum + o.total_amount, 0);
      const billSales = dayBills.reduce((sum, b) => sum + b.total, 0);
      const dailySales = orderSales + billSales;

      const orderCOGS = dayOrders.reduce(
        (sum, o) => sum + o.items.reduce((iSum, item) => iSum + (item.purchase_price || 0) * item.quantity, 0),
        0
      );
      const billCOGS = dayBills.reduce(
        (sum, b) => sum + b.items.reduce((iSum, item) => iSum + (item.purchase_price || 0) * item.quantity, 0),
        0
      );
      const dailyCOGS = orderCOGS + billCOGS;

      const dailyExpensesTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
      const dailyProfit = dailySales - dailyCOGS - dailyExpensesTotal;

      days.push({
        name: dayLabel,
        Sales: Math.max(0, dailySales),
        Profit: dailyProfit,
      });
    }

    return days;
  }, [orders, bills, expenses]);

  return (
    <div className="space-y-8">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Live Store Overview
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Good Morning, Owner 👋</h1>
          <p className="text-xs text-slate-400">Here is your daily store summary, sales performance, and stock alerts.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/owner/billing"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" /> POS Counter Bill
          </Link>
        </div>
      </div>

      {/* TOP KPI METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Sales */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Sales</span>
            <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">₹{totalSales.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">↑ Verified Store Revenues</span>
        </div>

        {/* Total Investment */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Investment</span>
            <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-xl">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">₹{totalInvestments.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Capital & Equipment</span>
        </div>

        {/* Total Expenses */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Expenses</span>
            <div className="p-2 bg-red-500/15 text-red-400 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">₹{totalExpenses.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Rent, Bills & Transport</span>
        </div>

        {/* Net Profit */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Net Profit</span>
            <div className="p-2 bg-teal-500/15 text-teal-400 rounded-xl">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ₹{netProfit.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Revenue - COGS - Expenses</span>
        </div>
      </div>

      {/* SECONDARY METRICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">Total Products</span>
            <span className="text-lg font-bold text-white">{products.length}</span>
          </div>
          <Package className="w-5 h-5 text-slate-500" />
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">Low Stock Alert</span>
            <span className="text-lg font-bold text-amber-400">{lowStockProducts.length}</span>
          </div>
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">Pending Orders</span>
            <span className="text-lg font-bold text-emerald-400">{pendingOrders.length}</span>
          </div>
          <ShoppingBag className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">Delivered Orders</span>
            <span className="text-lg font-bold text-white">{deliveredOrders.length}</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-slate-500" />
        </div>
      </div>

      {/* SALES CHART & LOW STOCK WIDGET GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales & Profit Visual Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-white">Sales & Profit Trend</h3>
              <p className="text-[11px] text-slate-400">Revenue performance vs net profit margin</p>
            </div>
            <Link href="/owner/sales" className="text-xs text-emerald-400 font-semibold hover:underline">
              Detailed Analytics →
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="Sales" stroke="#10b981" fillOpacity={1} fill="url(#salesGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="Profit" stroke="#14b8a6" fillOpacity={1} fill="url(#profitGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alert Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Low Stock Products ({lowStockProducts.length})
              </h3>
              <Link href="/owner/stock" className="text-xs text-slate-400 hover:text-white">
                View All
              </Link>
            </div>

            <div className="space-y-3 pt-3 max-h-64 overflow-y-auto">
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">✓ All product inventory healthy!</p>
              ) : (
                lowStockProducts.map((p) => (
                  <div key={p.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-white truncate">{p.name}</h4>
                      <p className="text-[10px] text-amber-400 font-bold">{p.stock_quantity} units remaining</p>
                    </div>

                    <button
                      onClick={() => restockProduct(p.id, 10, 'Restocked from dashboard')}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] px-3 py-1.5 rounded-xl transition-colors shrink-0"
                    >
                      + Restock 10
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/owner/stock"
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs text-center block transition-colors mt-4"
          >
            Manage Stock Matrix →
          </Link>
        </div>
      </div>

      {/* RECENT ORDERS FEED */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-base text-white">Recent Customer Orders</h3>
          <Link href="/owner/orders" className="text-xs text-emerald-400 font-semibold hover:underline">
            View All Orders ({orders.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {orders.slice(0, 5).map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{ord.order_number}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-white">{ord.customer_name}</p>
                    <p className="text-[10px] text-slate-400">{ord.customer_phone}</p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">₹{ord.total_amount}</td>
                  <td className="py-3.5 px-4 text-slate-300">{ord.delivery_type}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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
                    <Link
                      href="/owner/orders"
                      className="text-xs text-emerald-400 font-semibold hover:underline"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
