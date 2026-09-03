'use client';

import React, { useState } from 'react';
import { Package, Plus, Edit3, Trash2, Search, AlertTriangle, X, Sparkles, RefreshCw } from 'lucide-react';
import { useData } from '@/context/data-context';
import { Product } from '@/lib/types';

export default function OwnerProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct, clearAllDemoData } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [stockQuantity, setStockQuantity] = useState(10);
  const [lowStockLimit, setLowStockLimit] = useState(5);
  const [imageUrl, setImageUrl] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchQuery =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'ALL' || p.category_id === selectedCategory;
    return matchQuery && matchCategory;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || 'cat-1');
    setBrand('Sri Samundi');
    setDescription('');
    setPurchasePrice(10);
    setSellingPrice(12);
    setStockQuantity(50);
    setLowStockLimit(10);
    setImageUrl('https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=400&q=80');
    setModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.category_id);
    setBrand(p.brand);
    setDescription(p.description);
    setPurchasePrice(p.purchase_price);
    setSellingPrice(p.selling_price);
    setStockQuantity(p.stock_quantity);
    setLowStockLimit(p.low_stock_limit);
    setImageUrl(p.image_url);
    setModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        category_id: categoryId,
        brand,
        description,
        purchase_price: Number(purchasePrice),
        selling_price: Number(sellingPrice),
        stock_quantity: Number(stockQuantity),
        low_stock_limit: Number(lowStockLimit),
        image_url: imageUrl,
      });
    } else {
      addProduct({
        name,
        category_id: categoryId || categories[0]?.id || 'cat-1',
        brand: brand || 'Sri Samundi',
        description,
        purchase_price: Number(purchasePrice),
        selling_price: Number(sellingPrice),
        stock_quantity: Number(stockQuantity),
        low_stock_limit: Number(lowStockLimit),
        image_url: imageUrl || 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=400&q=80',
        is_active: true,
      });
    }

    setModalOpen(false);
  };

  const handleImportSriSamundiStarter = () => {
    const starterItems = [
      { id: 'p-starter-1', name: 'Special Masala Milk Tea (Cup)', category_id: 'cat-1', brand: 'Sri Samundi', description: 'Fresh hot brewed ginger cardamom tea', purchase_price: 6, selling_price: 12, stock_quantity: 100, low_stock_limit: 20, image_url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=400&q=80', is_active: true },
      { id: 'p-starter-2', name: 'Filter Coffee (Cup)', category_id: 'cat-1', brand: 'Sri Samundi', description: 'Authentic South Indian aromatic filter coffee', purchase_price: 8, selling_price: 15, stock_quantity: 80, low_stock_limit: 15, image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80', is_active: true },
      { id: 'p-starter-3', name: 'Butter Milk Biscuit (Pack)', category_id: 'cat-2', brand: 'Britannia', description: 'Crispy tea time snack biscuits', purchase_price: 8, selling_price: 10, stock_quantity: 40, low_stock_limit: 10, image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80', is_active: true },
      { id: 'p-starter-4', name: 'Full Cream Milk Packet 500ml', category_id: 'cat-4', brand: 'Aavin / Amul', description: 'Fresh pasteurized daily milk packet', purchase_price: 24, selling_price: 28, stock_quantity: 30, low_stock_limit: 5, image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80', is_active: true },
      { id: 'p-starter-5', name: 'Chilled Soft Drink Bottle 500ml', category_id: 'cat-3', brand: 'Thums Up', description: 'Refreshing cold soft drink bottle', purchase_price: 32, selling_price: 40, stock_quantity: 25, low_stock_limit: 5, image_url: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=400&q=80', is_active: true },
    ];

    starterItems.forEach((item) => addProduct(item));
  };

  const confirmDelete = () => {
    if (deleteModalId) {
      deleteProduct(deleteModalId);
      setDeleteModalId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Sri Samundi Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">Add your original store items, prices, stock quantities, and margin analytics.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {products.length > 0 && (
            <button
              onClick={() => setShowClearAllModal(true)}
              className="bg-slate-800 hover:bg-red-500/20 text-red-400 border border-slate-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear All Items
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Add Original Product
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'ALL' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table OR Empty Catalog State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-slate-800 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white">Your Product Catalog is Empty</h3>
            <p className="text-xs text-slate-400">
              Demo products have been cleared! Click below to start adding your original shop products.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleOpenAddModal}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" /> Add Your First Product
            </button>
            <button
              onClick={handleImportSriSamundiStarter}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> Import Tea & Snacks Starter Template
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950/50">
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Purchase Price</th>
                  <th className="py-3.5 px-4">Selling Price</th>
                  <th className="py-3.5 px-4">Margin / Profit</th>
                  <th className="py-3.5 px-4">Stock Qty</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProducts.map((p) => {
                  const margin = p.selling_price - p.purchase_price;
                  const marginPct = p.purchase_price > 0 ? Math.round((margin / p.purchase_price) * 100) : 0;
                  const categoryName = categories.find((c) => c.id === p.category_id)?.name || 'General';

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-slate-950 border border-slate-800" />
                          <div>
                            <p className="font-bold text-white text-sm">{p.name}</p>
                            <span className="text-[10px] text-emerald-400 font-semibold">{p.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{categoryName}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-400">₹{p.purchase_price}</td>
                      <td className="py-3.5 px-4 font-bold text-white">₹{p.selling_price}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-400 font-bold">₹{margin}</span>{' '}
                        <span className="text-[10px] text-slate-400">({marginPct}%)</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold px-2.5 py-1 rounded-lg text-[10px] ${
                            p.stock_quantity <= 0
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : p.stock_quantity <= p.low_stock_limit
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {p.stock_quantity <= 0 ? 'Out of Stock (0)' : `${p.stock_quantity} in stock`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteModalId(p.id)}
                            className="p-2 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white">
                {editingProduct ? 'Edit Product Details' : 'Add Original Product to Sri Samundi Store'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Tea Cup / Britannia Biscuits 100g"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sri Samundi / Amul"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Product features, weight, packaging info..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Purchase Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Low Stock Limit Alert</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={lowStockLimit}
                    onChange={(e) => setLowStockLimit(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION SAFETY MODAL */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-white">Delete Product?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete this product? Historical order invoices will remain preserved.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteModalId(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL ITEMS CONFIRMATION MODAL */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-white">Clear All Products?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to clear all items from your catalog? This will reset your product list so you can start adding your original store products.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowClearAllModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllDemoData();
                  setShowClearAllModal(false);
                }}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-red-500/20 transition-colors"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
