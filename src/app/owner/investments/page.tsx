'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function OwnerInvestmentsPage() {
  const { investments, totalInvestments, addInvestment } = useData();

  const [amount, setAmount] = useState(10000);
  const [category, setCategory] = useState<'Stock Purchase' | 'Shop Equipment' | 'Furniture' | 'Renovation' | 'Marketing' | 'Other'>('Stock Purchase');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    addInvestment({
      amount: Number(amount),
      category,
      description: description || category,
      date,
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xl transition-colors">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Investment Management</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Record capital investments, equipment, furniture, and shop setup expenses.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Log Investment
        </button>
      </div>

      {/* Total Investment Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl transition-colors">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total Capital Invested</span>
        <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">₹{totalInvestments.toLocaleString()}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Cumulative store capital across all recorded investments</p>
      </div>

      {/* Investments Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] bg-slate-50 dark:bg-slate-950/50">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Type / Category</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {investments.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{inv.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold text-[10px]">
                      {inv.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{inv.description}</td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">₹{inv.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG INVESTMENT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl transition-colors">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Log New Store Investment</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Investment Type *</label>
                <select
                  value={category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as 'Stock Purchase' | 'Shop Equipment' | 'Furniture' | 'Renovation' | 'Marketing' | 'Other')}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="Stock Purchase" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Stock Purchase</option>
                  <option value="Shop Equipment" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Shop Equipment</option>
                  <option value="Furniture" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Furniture</option>
                  <option value="Renovation" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Renovation</option>
                  <option value="Marketing" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Marketing</option>
                  <option value="Other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Purchased commercial freezer"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-colors"
                >
                  Save Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
