'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Printer, Download, Store, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function DigitalInvoicePage() {
  const params = useParams();
  const token = params.token as string;
  const { shop, orders, bills } = useData();

  // Find order or bill matching this secure invoice token or ID
  const matchedOrder = orders.find(
    (o) => o.invoice_token === token || o.id === token || o.order_number.toLowerCase() === token.toLowerCase()
  );

  const matchedBill = bills.find(
    (b) => b.invoice_token === token || b.id === token || b.bill_number.toLowerCase() === token.toLowerCase()
  );

  const invoiceData = matchedOrder || matchedBill;

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-white">Invoice Not Found</h1>
          <p className="text-xs text-slate-400">
            The requested invoice link is invalid or has expired. Please verify your invoice link or contact {shop.name}.
          </p>
          <Link href="/" className="inline-flex items-center gap-1.5 bg-emerald-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs">
            <ArrowLeft className="w-4 h-4" /> Go to Storefront
          </Link>
        </div>
      </div>
    );
  }

  const isOrder = 'order_number' in invoiceData;
  const invoiceNo = invoiceData.invoice_number || (isOrder ? `INV-${invoiceData.order_number}` : invoiceData.bill_number);
  const orderNo = isOrder ? invoiceData.order_number : (invoiceData.order_id || 'POS Counter');
  const customerMobile = isOrder ? (invoiceData.customer_mobile || invoiceData.customer_phone || 'N/A') : (invoiceData.customer_mobile || 'N/A');
  const items = invoiceData.items || [];
  const createdDate = new Date(invoiceData.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation & Controls Bar (Hidden on Print) */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl print:hidden shadow-lg">
          <Link href="/" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" /> Print / Download PDF Invoice
            </button>
          </div>
        </div>

        {/* SECURE DIGITAL INVOICE CARD */}
        <div className="bg-white text-slate-900 rounded-3xl p-8 sm:p-10 space-y-6 shadow-2xl font-sans print:shadow-none print:p-0">
          {/* Shop Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 gap-4">
            <div className="flex items-center gap-3">
              {shop.logo_url ? (
                <img src={shop.logo_url} alt={shop.name} className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-200" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl">
                  <Store className="w-7 h-7" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">{shop.name}</h1>
                <p className="text-xs text-slate-600">{shop.address}</p>
                <p className="text-xs text-slate-600">Phone: {shop.phone} • Email: {shop.email}</p>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider block mb-1">
                Official Digital Invoice
              </span>
              <p className="text-sm font-extrabold text-slate-900">{invoiceNo}</p>
              <p className="text-[11px] text-slate-500">Date: {createdDate}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-6">
            <div>
              <h3 className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Customer Details</h3>
              <p className="text-sm font-bold text-slate-900">{invoiceData.customer_name}</p>
              <p className="text-slate-600">Mobile: <strong className="text-slate-900">{customerMobile}</strong></p>
              {isOrder && invoiceData.delivery_address && (
                <p className="text-slate-600 pt-1">
                  Address: {invoiceData.delivery_address.address}, {invoiceData.delivery_address.area},{' '}
                  {invoiceData.delivery_address.city} - {invoiceData.delivery_address.pincode}
                </p>
              )}
            </div>

            <div className="text-left sm:text-right space-y-1">
              <h3 className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Order Summary</h3>
              <p className="text-slate-700">Order Ref: <strong>#{orderNo}</strong></p>
              <p className="text-slate-700">Payment Method: <strong>{invoiceData.payment_method}</strong></p>
              <p className="text-slate-700">
                Payment Status:{' '}
                <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md text-[10px] inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Paid / Completed
                </span>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Purchased Items</h3>
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead>
                <tr className="text-slate-600 font-bold bg-slate-50">
                  <th className="py-2.5 px-3 rounded-l-xl">Product Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right rounded-r-xl">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-3 px-3 font-bold text-slate-900">{it.product_name}</td>
                    <td className="py-3 px-3 text-center text-slate-700 font-semibold">{it.quantity}</td>
                    <td className="py-3 px-3 text-right text-slate-700">₹{it.selling_price}</td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-900">₹{it.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Price Calculation Summary */}
          <div className="border-t border-slate-200 pt-4 flex flex-col items-end text-xs space-y-1.5">
            <div className="flex justify-between w-48 text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900">₹{invoiceData.subtotal}</span>
            </div>
            {Boolean(invoiceData.discount) && (
              <div className="flex justify-between w-48 text-emerald-600 font-medium">
                <span>Discount:</span>
                <span>-₹{invoiceData.discount}</span>
              </div>
            )}
            {Boolean(invoiceData.delivery_charge) && (
              <div className="flex justify-between w-48 text-slate-600">
                <span>Delivery Charge:</span>
                <span className="font-bold text-slate-900">+₹{invoiceData.delivery_charge}</span>
              </div>
            )}
            <div className="flex justify-between w-56 text-base font-black border-t border-slate-300 pt-2 text-slate-900">
              <span>Grand Total:</span>
              <span className="text-emerald-600">₹{'total_amount' in invoiceData ? invoiceData.total_amount : invoiceData.total}</span>
            </div>
          </div>

          {/* Thank You Footer */}
          <div className="border-t border-slate-200 pt-6 text-center text-xs text-slate-600 space-y-1">
            <p className="font-extrabold text-slate-900 text-sm">Thank you for shopping with {shop.name}!</p>
            <p className="text-[11px] text-slate-500">We appreciate your business. Visit us again or order online anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
