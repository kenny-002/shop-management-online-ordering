'use client';

import React, { useState } from 'react';
import { Layers, AlertTriangle, Plus, RefreshCw, History, Search } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function OwnerStockPage() {
  const { products, stockMovements, restockProduct } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductRestock, setSelectedProductRestock] = useState<string | null>(null);
  const [customQty, setCustomQty] = useState<number>(10);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductRestock && customQty > 0) {
      restockProduct(selectedProductRestock, customQty, 'Manual stock increment');
      setSelectedProductRestock(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Stock Management Matrix</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor live stock levels, perform fast restocks, and inspect complete stock movement logs.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search stock..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-700 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Stock Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950/50">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Purchase Price</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProducts.map((p) => {
                const isOut = p.stock_quantity <= 0;
                const isLow = !isOut && p.stock_quantity <= p.low_stock_limit;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {p.name} <span className="text-[10px] text-emerald-400 font-normal block">{p.brand}</span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-sm text-white">{p.stock_quantity} units</td>
                    <td className="py-3.5 px-4 text-slate-400">₹{p.purchase_price}</td>
                    <td className="py-3.5 px-4 text-white font-semibold">₹{p.selling_price}</td>
                    <td className="py-3.5 px-4">
                      {isOut ? (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          🔴 Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          🟡 Low Stock
                        </span>
                      ) : (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          🟢 In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => restockProduct(p.id, 5, 'Quick +5 restock')}
                          className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-2.5 py-1 rounded-lg text-[10px]"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => restockProduct(p.id, 10, 'Quick +10 restock')}
                          className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-2.5 py-1 rounded-lg text-[10px]"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProductRestock(p.id);
                            setCustomQty(20);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-[10px]"
                        >
                          Custom
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* STOCK MOVEMENT HISTORY LOG */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" /> Stock Movement Audit Trail
          </h3>
          <span className="text-[10px] text-slate-400">Recorded automatically by orders, sales, and restocks</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {stockMovements.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No recent stock movement logs.</p>
          ) : (
            stockMovements.map((sm) => (
              <div key={sm.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="font-bold text-white">{sm.product_name || 'Product'}</span>
                  <span className="text-[10px] text-slate-400 block">{sm.note} • Ref: {sm.reference_id || 'N/A'}</span>
                </div>

                <div className="text-right">
                  <span
                    className={`font-black ${
                      sm.quantity > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {sm.quantity > 0 ? `+${sm.quantity}` : sm.quantity} units
                  </span>
                  <span className="text-[10px] text-slate-500 block">{new Date(sm.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CUSTOM RESTOCK MODAL */}
      {selectedProductRestock && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-white">Custom Restock Inventory</h3>
            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Add Quantity Units</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={customQty}
                  onChange={(e) => setCustomQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProductRestock(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl shadow"
                >
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
