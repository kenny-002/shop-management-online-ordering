'use client';

import React, { useState } from 'react';
import { PiggyBank, Plus, Calendar, DollarSign, Tag } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Investment Management</h1>
          <p className="text-xs text-slate-400 mt-1">Record capital investments, equipment, furniture, and shop setup expenses.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Log Investment
        </button>
      </div>

      {/* Total Investment Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
        <span className="text-xs text-slate-400 font-medium">Total Capital Invested</span>
        <p className="text-3xl font-black text-emerald-400">₹{totalInvestments.toLocaleString()}</p>
        <p className="text-xs text-slate-500">Cumulative store capital across all recorded investments</p>
      </div>

      {/* Investments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950/50">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Type / Category</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {investments.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400">{inv.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold text-[10px]">
                      {inv.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">{inv.description}</td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-400 text-sm">₹{inv.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG INVESTMENT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-white">Log New Store Investment</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Investment Type *</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5"
                >
                  <option value="Stock Purchase">Stock Purchase</option>
                  <option value="Shop Equipment">Shop Equipment</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Renovation">Renovation</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Purchased commercial freezer"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl"
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
