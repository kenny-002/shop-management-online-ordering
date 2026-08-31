'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, AlertTriangle } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function CartPage() {
  const { cart, shop, updateCartQuantity, removeFromCart, clearCart } = useData();

  const subtotal = cart.reduce((acc, item) => acc + item.product.selling_price * item.quantity, 0);
  const deliveryCharge = subtotal > 0 ? shop.delivery_charge : 0;
  const total = subtotal + deliveryCharge;

  const isFreeDeliveryEligible = subtotal >= shop.minimum_order;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-900 border border-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">Your Shopping Cart is Empty</h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Explore our wide selection of fresh groceries and daily essentials to add items to your cart!
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-8 py-3.5 rounded-xl text-sm transition-all hover:scale-105"
        >
          Browse Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Your Shopping Cart</h1>
          <p className="text-xs text-slate-400 mt-1">Review your items and proceed to instant checkout</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl"
        >
          <Trash2 className="w-4 h-4" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Itemized List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(({ product, quantity }) => {
            const itemSubtotal = product.selling_price * quantity;
            const maxStock = product.stock_quantity;

            return (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase">{product.brand}</span>
                    <h3 className="font-bold text-sm text-white line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-slate-400">Unit Price: ₹{product.selling_price}</p>
                    <p className="text-[11px] text-slate-500">In Stock: {maxStock} available</p>
                  </div>
                </div>

                {/* Quantity Modifier & Item Subtotal */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                  <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl p-1">
                    <button
                      onClick={() => updateCartQuantity(product.id, quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-extrabold text-white text-sm">{quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(product.id, quantity + 1)}
                      disabled={quantity >= maxStock}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <span className="text-[10px] text-slate-400 block">Subtotal</span>
                    <span className="text-base font-black text-white">₹{itemSubtotal}</span>
                  </div>

                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Pricing Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl sticky top-24">
          <h3 className="font-extrabold text-lg text-white border-b border-slate-800 pb-3">Order Summary</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Items Subtotal</span>
              <span className="font-bold text-white">₹{subtotal}</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400" /> Delivery Charge
              </span>
              <span className="font-bold text-white">
                {deliveryCharge === 0 ? <span className="text-emerald-400">FREE</span> : `₹${deliveryCharge}`}
              </span>
            </div>

            {!isFreeDeliveryEligible && (
              <p className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Add ₹{shop.minimum_order - subtotal} more for free local delivery!
              </p>
            )}

            <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-base text-white">Total Amount</span>
              <span className="font-black text-2xl text-emerald-400">₹{total}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm transition-all hover:scale-102"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
