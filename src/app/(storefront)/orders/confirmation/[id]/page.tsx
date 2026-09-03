'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Clock, MapPin, Truck, AlertCircle } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { orders } = useData();

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Order Not Found</h2>
        <p className="text-xs text-slate-400">We couldn&apos;t locate this order ID.</p>
        <Link href="/products" className="inline-block bg-emerald-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs">
          Return to Storefront
        </Link>
      </div>
    );
  }

  const statuses = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];
  const currentStep = statuses.indexOf(order.order_status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Celebration Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-8 text-center text-white space-y-3 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto text-white">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black">Order Placed Successfully! 🎉</h1>
        <p className="text-sm text-emerald-100 max-w-md mx-auto">
          Thank you <strong className="text-white">{order.customer_name}</strong>. Your order{' '}
          <span className="font-mono bg-white/20 px-2 py-0.5 rounded font-bold">{order.order_number}</span> has been received by the shop.
        </p>
      </div>

      {/* Live Order Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="font-extrabold text-base text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" /> Order Status Timeline
        </h3>

        {order.order_status === 'Cancelled' ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            This order has been cancelled by the shop owner or customer.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
            {statuses.map((st, idx) => {
              const isDone = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div
                  key={st}
                  className={`p-3 rounded-2xl text-center border transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-lg scale-105'
                      : isDone
                      ? 'bg-slate-800 text-emerald-400 border-slate-700 font-semibold'
                      : 'bg-slate-950 text-slate-600 border-slate-900'
                  }`}
                >
                  <span className="text-[10px] block opacity-80">Step {idx + 1}</span>
                  <span className="text-xs">{st}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Itemized Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
          <div>
            <span className="text-xs text-slate-400">Order Reference ID</span>
            <h2 className="text-xl font-mono font-bold text-emerald-400">{order.order_number}</h2>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-400">
            <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
            <p>Payment: <strong className="text-emerald-400">{order.payment_method} ({order.payment_status})</strong></p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-slate-200">Purchased Items</h4>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-sm">
                <div>
                  <h5 className="font-semibold text-white">{item.product_name}</h5>
                  <span className="text-xs text-slate-400">Qty: {item.quantity} x ₹{item.selling_price}</span>
                </div>
                <span className="font-bold text-white">₹{item.subtotal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Summary */}
        <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal</span>
            <span className="font-semibold text-white">₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Delivery Charge</span>
            <span className="font-semibold text-white">
              {order.delivery_charge === 0 ? 'FREE' : `₹${order.delivery_charge}`}
            </span>
          </div>
          <div className="border-t border-slate-800 pt-2 flex justify-between text-base font-bold">
            <span className="text-white">Total Amount Paid</span>
            <span className="text-emerald-400 font-black text-xl">₹{order.total_amount}</span>
          </div>
        </div>

        {/* Delivery / Pickup Address */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-1">
          <p className="font-bold text-white flex items-center gap-1.5">
            {order.delivery_type === 'Home Delivery' ? <Truck className="w-4 h-4 text-emerald-400" /> : <MapPin className="w-4 h-4 text-emerald-400" />}
            {order.delivery_type} Details
          </p>
          <p><strong className="text-slate-300">Customer:</strong> {order.customer_name} ({order.customer_phone})</p>
          {order.delivery_address && (
            <p><strong className="text-slate-300">Address:</strong> {order.delivery_address.address}, {order.delivery_address.area}, {order.delivery_address.city} - {order.delivery_address.pincode}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Link href="/my-orders" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
          View All My Orders →
        </Link>
        <Link href="/products" className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
