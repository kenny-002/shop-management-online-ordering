'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useData } from '@/context/data-context';
import { useTheme } from '@/context/theme-context';

export default function OwnerProfitPage() {
  const { totalSales, totalProductCostOfSales, grossProfit, totalExpenses, netProfit } = useData();
  const { theme } = useTheme();

  const marginPct = totalSales > 0 ? Math.round((grossProfit / totalSales) * 100) : 0;
  const netMarginPct = totalSales > 0 ? Math.round((netProfit / totalSales) * 100) : 0;

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const axisColor = isDark ? '#64748b' : '#64748b';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#cbd5e1';
  const tooltipTextColor = isDark ? '#f8fafc' : '#0f172a';

  const profitChartData = [
    { name: 'Revenue', Amount: totalSales },
    { name: 'Cost of Goods', Amount: totalProductCostOfSales },
    { name: 'Gross Profit', Amount: grossProfit },
    { name: 'Expenses', Amount: totalExpenses },
    { name: 'Net Profit', Amount: netProfit },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xl transition-colors">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Financial Profit Analytics</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Automatic financial accounting based on product purchase prices, sales revenues, and expenses.</p>
        </div>
      </div>

      {/* Formula Explanation Banner */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 dark:text-slate-300 shadow-xl transition-colors">
        <div className="space-y-1">
          <span className="font-bold text-emerald-600 dark:text-emerald-400">Gross Profit Formula:</span>
          <p className="text-slate-600 dark:text-slate-400">Gross Profit = Total Revenue (₹{totalSales}) - Product Cost of Sales (₹{totalProductCostOfSales})</p>
          <p className="text-slate-900 dark:text-white font-bold text-sm pt-1">= ₹{grossProfit.toLocaleString()} ({marginPct}% Gross Margin)</p>
        </div>

        <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
          <span className="font-bold text-teal-600 dark:text-teal-400">Net Profit Formula:</span>
          <p className="text-slate-600 dark:text-slate-400">Net Profit = Gross Profit (₹{grossProfit}) - Total Expenses (₹{totalExpenses})</p>
          <p className="text-slate-900 dark:text-white font-bold text-sm pt-1">= ₹{netProfit.toLocaleString()} ({netMarginPct}% Net Margin)</p>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl transition-colors">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Sales Revenue</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white">₹{totalSales.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Gross inflows from all orders & bills</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl transition-colors">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Product Cost (COGS)</span>
          <p className="text-3xl font-black text-slate-600 dark:text-slate-400">₹{totalProductCostOfSales.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Wholesale purchase price of sold inventory</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl transition-colors">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Gross Profit</span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">₹{grossProfit.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{marginPct}% margin on revenue</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl transition-colors">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total Shop Expenses</span>
          <p className="text-3xl font-black text-red-600 dark:text-red-400">₹{totalExpenses.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Rent, electricity, salary, transport, packaging</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl transition-colors">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Final Net Profit</span>
          <p className={`text-3xl font-black ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            ₹{netProfit.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Final takeaway profit after all costs</span>
        </div>
      </div>

      {/* Profit Visual Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl transition-colors">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Financial Breakdown Visualization</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={profitChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={axisColor} fontSize={11} />
              <YAxis stroke={axisColor} fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipTextColor }} />
              <Bar dataKey="Amount" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
