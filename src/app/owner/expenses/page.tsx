'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function OwnerExpensesPage() {
  const { expenses, totalExpenses, addExpense } = useData();

  const [amount, setAmount] = useState(2500);
  const [category, setCategory] = useState<'Rent' | 'Electricity' | 'Transport' | 'Salary' | 'Maintenance' | 'Marketing' | 'Packaging' | 'Other'>('Electricity');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    addExpense({
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs dark:shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Expense Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Record shop operating expenses including Rent, Electricity, Transport, Salary, & Packaging.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white dark:text-slate-950 font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Total Expense Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-2 shadow-xs dark:shadow-xl">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Operating Expenses</span>
        <p className="text-3xl font-black text-red-600 dark:text-red-400">₹{totalExpenses.toLocaleString()}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">Deducted automatically from Gross Profit to calculate Net Profit</p>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] bg-slate-50 dark:bg-slate-950/50">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Expense Description</th>
                <th className="py-3.5 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">{exp.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 px-2.5 py-1 rounded-lg font-bold text-[10px]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{exp.description}</td>
                  <td className="py-3.5 px-4 text-right font-black text-red-600 dark:text-red-400 text-sm">₹{exp.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG EXPENSE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Record Operating Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Expense Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Expense Category *</label>
                <select
                  value={category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as 'Rent' | 'Electricity' | 'Transport' | 'Salary' | 'Maintenance' | 'Marketing' | 'Packaging' | 'Other')}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-hidden"
                >
                  <option value="Rent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Rent</option>
                  <option value="Electricity" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Electricity</option>
                  <option value="Transport" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Transport</option>
                  <option value="Salary" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Salary</option>
                  <option value="Maintenance" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Maintenance</option>
                  <option value="Marketing" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Marketing</option>
                  <option value="Packaging" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Packaging</option>
                  <option value="Other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Paid monthly shop electricity bill"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold py-2.5 rounded-xl shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
