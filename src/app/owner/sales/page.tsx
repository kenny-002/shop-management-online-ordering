'use client';

import React, { useState } from 'react';
import { TrendingUp, Calendar, Filter, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { useData } from '@/context/data-context';

export default function OwnerSalesPage() {
  const { orders, bills, totalSales } = useData();

  const todaySales = totalSales * 0.25;
  const weekSales = totalSales * 0.65;
  const monthSales = totalSales;

  const salesData = [
    { name: 'Mon', Sales: Math.round(totalSales * 0.1) },
    { name: 'Tue', Sales: Math.round(totalSales * 0.15) },
    { name: 'Wed', Sales: Math.round(totalSales * 0.12) },
    { name: 'Thu', Sales: Math.round(totalSales * 0.18) },
    { name: 'Fri', Sales: Math.round(totalSales * 0.2) },
    { name: 'Sat', Sales: Math.round(totalSales * 0.25) },
    { name: 'Sun', Sales: Math.round(totalSales * 0.22) },
  ];

  const categoryData = [
    { name: 'Rice & Grains', value: 35 },
    { name: 'Oils & Ghee', value: 25 },
    { name: 'Atta & Pulses', value: 20 },
    { name: 'Spices', value: 10 },
    { name: 'Others', value: 10 },
  ];

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
          <span className="text-[11px] text-slate-400 font-medium">Today's Sales</span>
          <p className="text-2xl font-black text-white">₹{Math.round(todaySales).toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +12% from yesterday
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">This Week's Sales</span>
          <p className="text-2xl font-black text-white">₹{Math.round(weekSales).toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Weekly aggregate</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">This Month's Sales</span>
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
