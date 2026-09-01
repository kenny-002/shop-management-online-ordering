'use client';

import React, { useState } from 'react';
import { TrendingUp, Calendar, Filter, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { useData } from '@/context/data-context';

export default function OwnerSalesPage() {
  const { orders, bills, totalSales, categories, products } = useData();

  const now = new Date();

  const isSameCalendarDay = (dateString?: string, targetDate: Date = now) => {
    if (!dateString) return false;
    const itemDate = new Date(dateString);
    return (
      itemDate.getFullYear() === targetDate.getFullYear() &&
      itemDate.getMonth() === targetDate.getMonth() &&
      itemDate.getDate() === targetDate.getDate()
    );
  };

  const validOrders = React.useMemo(() => orders.filter((o) => o.order_status !== 'Cancelled'), [orders]);

  const todaySales = React.useMemo(() => {
    const oTotal = validOrders.filter((o) => isSameCalendarDay(o.created_at)).reduce((sum, o) => sum + o.total_amount, 0);
    const bTotal = bills.filter((b) => isSameCalendarDay(b.created_at)).reduce((sum, b) => sum + b.total, 0);
    return oTotal + bTotal;
  }, [validOrders, bills]);

  const yesterdaySales = React.useMemo(() => {
    const yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const oTotal = validOrders.filter((o) => isSameCalendarDay(o.created_at, yest)).reduce((sum, o) => sum + o.total_amount, 0);
    const bTotal = bills.filter((b) => isSameCalendarDay(b.created_at, yest)).reduce((sum, b) => sum + b.total, 0);
    return oTotal + bTotal;
  }, [validOrders, bills]);

  const pctChange = yesterdaySales > 0 ? Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100) : todaySales > 0 ? 100 : 0;

  const weekSales = React.useMemo(() => {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const oTotal = validOrders.filter((o) => new Date(o.created_at) >= sevenDaysAgo).reduce((sum, o) => sum + o.total_amount, 0);
    const bTotal = bills.filter((b) => new Date(b.created_at) >= sevenDaysAgo).reduce((sum, b) => sum + b.total, 0);
    return oTotal + bTotal;
  }, [validOrders, bills]);

  const monthSales = React.useMemo(() => {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const oTotal = validOrders.filter((o) => new Date(o.created_at) >= thirtyDaysAgo).reduce((sum, o) => sum + o.total_amount, 0);
    const bTotal = bills.filter((b) => new Date(b.created_at) >= thirtyDaysAgo).reduce((sum, b) => sum + b.total, 0);
    return oTotal + bTotal;
  }, [validOrders, bills]);

  const salesData = React.useMemo(() => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayName = i === 0 ? 'Today' : dayNames[d.getDay()];

      const dayOrders = validOrders.filter((o) => isSameCalendarDay(o.created_at, d));
      const dayBills = bills.filter((b) => isSameCalendarDay(b.created_at, d));

      const oTotal = dayOrders.reduce((sum, o) => sum + o.total_amount, 0);
      const bTotal = dayBills.reduce((sum, b) => sum + b.total, 0);

      days.push({
        name: dayName,
        Sales: oTotal + bTotal,
      });
    }
    return days;
  }, [validOrders, bills]);

  const categoryData = React.useMemo(() => {
    const catMap: Record<string, number> = {};

    categories.forEach((cat) => {
      catMap[cat.name] = 0;
    });

    const getCatName = (productId: string) => {
      const prod = products.find((p) => p.id === productId);
      if (!prod) return 'Others';
      const cat = categories.find((c) => c.id === prod.category_id);
      return cat ? cat.name : 'Others';
    };

    validOrders.forEach((ord) => {
      ord.items.forEach((item) => {
        const cName = getCatName(item.product_id);
        catMap[cName] = (catMap[cName] || 0) + item.subtotal;
      });
    });

    bills.forEach((b) => {
      b.items.forEach((item) => {
        const cName = getCatName(item.product_id);
        catMap[cName] = (catMap[cName] || 0) + item.subtotal;
      });
    });

    const entries = Object.entries(catMap).map(([name, value]) => ({ name, value }));
    const nonZero = entries.filter((e) => e.value > 0);

    if (nonZero.length > 0) return nonZero;

    return categories.slice(0, 5).map((c) => ({ name: c.name, value: 0 }));
  }, [validOrders, bills, categories, products]);

  const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Sales Analytics Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Track daily sales volume, top categories, and revenue trends.</p>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Today&apos;s Sales</span>
          <p className="text-2xl font-black text-white">₹{Math.round(todaySales).toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> {pctChange >= 0 ? `+${pctChange}%` : `${pctChange}%`} from yesterday
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Week&apos;s Sales</span>
          <p className="text-2xl font-black text-white">₹{Math.round(weekSales).toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Weekly aggregate</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Month&apos;s Sales</span>
          <p className="text-2xl font-black text-white">₹{Math.round(monthSales).toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Monthly aggregate</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Total Lifetime Revenue</span>
          <p className="text-2xl font-black text-emerald-400">₹{totalSales.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Online + POS Counter</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-base text-white">Weekly Sales Volume (₹)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="Sales" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-base text-white">Category Sales Distribution</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} fill="#8884d8" label>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
