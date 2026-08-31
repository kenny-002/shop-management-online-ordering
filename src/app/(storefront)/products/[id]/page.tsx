'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, ShoppingCart, Plus, Minus, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { products, categories, addToCart } = useData();

  const product = products.find((p) => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
        <p className="text-xs text-slate-400">The product you are looking for may have been removed or updated.</p>
        <Link href="/products" className="inline-block bg-emerald-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;
  const categoryName = categories.find((c) => c.id === product.category_id)?.name || 'General';

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link href="/products" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 shadow-2xl">
        {/* Product Image Display */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4">
            {isOutOfStock ? (
              <span className="bg-red-500 text-white font-bold text-xs uppercase px-3 py-1 rounded-full shadow">
                Out of Stock
              </span>
            ) : (
              <span className="bg-emerald-500 text-slate-950 font-bold text-xs uppercase px-3 py-1 rounded-full shadow">
                {product.stock_quantity} Available in Stock
              </span>
            )}
          </div>
        </div>

        {/* Product Details & Purchase Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-2.5 py-1 rounded-lg">
                {product.brand}
              </span>
              <span>Category: <strong className="text-slate-200">{categoryName}</strong></span>
            </div>

            <h1 className="text-3xl font-black text-white">{product.name}</h1>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-white">₹{product.selling_price}</span>
              <span className="text-xs text-slate-400">per piece (inclusive of all taxes)</span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed border-t border-b border-slate-800 py-4">
              {product.description}
            </p>
          </div>

          {/* Quantity Modifier & CTA Buttons */}
          <div className="space-y-6">
            {!isOutOfStock && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Select Quantity:</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-extrabold text-white text-base">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                      disabled={quantity >= product.stock_quantity}
                      className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">Max limit: {product.stock_quantity}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : added
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 text-emerald-400" /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-105'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Buy Now
              </button>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 text-[11px] text-slate-400 text-center">
              <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                <Truck className="w-4 h-4 text-emerald-400 mx-auto mb-1" /> Express Home Delivery
              </div>
              <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" /> 100% Fresh & Authentic
              </div>
              <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                <RefreshCw className="w-4 h-4 text-emerald-400 mx-auto mb-1" /> Easy Replacement
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
