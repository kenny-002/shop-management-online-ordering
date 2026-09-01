'use client';

import React from 'react';
import { Store, MapPin, Phone, Mail, Clock, Truck, ShieldCheck, ExternalLink } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function ShopInfoPage() {
  const { shop } = useData();

  const shopPhotos = [
    { url: '/images/shop/sri-samundi-store-front.jpg', title: 'Sri Samundi Main Store Front & MilkyMist Freezer' },
    { url: '/images/shop/sri-samundi-biscuits-snacks.jpg', title: 'Packaged Snacks, Biscuits & Rusks Counter' },
    { url: '/images/shop/sri-samundi-store-inside.jpg', title: 'Store Interior & Daily Groceries Shelves' },
    { url: '/images/shop/sri-samundi-board-sign.jpg', title: 'MilkyMist Sri Samundi Store Signboard' },
    { url: '/images/shop/sri-samundi-counter-display.jpg', title: 'Tea Stall Counter & Billing Counter' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left">
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
            Store Profile & Location
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{shop.name}</h1>
          <p className="text-sm text-slate-300 max-w-xl">{shop.description}</p>
        </div>

        <a
          href={shop.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 shrink-0"
        >
          <MapPin className="w-5 h-5" /> Get Directions
        </a>
      </div>

      {/* Grid: Timing & Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Timing Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Opening Hours</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{shop.opening_hours}</p>
          <p className="text-[11px] text-emerald-400 font-semibold pt-1">Open 7 Days a Week</p>
        </div>

        {/* Contact Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Contact Store</h3>
          <p className="text-xs text-slate-300">Phone: <strong className="text-white">{shop.phone}</strong></p>
          <p className="text-xs text-slate-300">Email: <strong className="text-white">{shop.email}</strong></p>
        </div>

        {/* Home Delivery Rules Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Delivery Options</h3>
          <p className="text-xs text-slate-300">Delivery Charge: <strong className="text-white">₹{shop.delivery_charge}</strong></p>
          <p className="text-xs text-slate-300">Minimum Order: <strong className="text-white">₹{shop.minimum_order}</strong></p>
          <p className="text-[11px] text-slate-400 pt-1">Areas: {shop.delivery_areas}</p>
        </div>
      </div>

      {/* Store Photos Gallery */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Store Photos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {shopPhotos.map((photo, i) => (
            <div key={i} className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
              <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-semibold text-white">{photo.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Embed Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-emerald-400" /> Interactive Google Map
            </h2>
            <p className="text-xs text-slate-400">{shop.address}</p>
          </div>
          <a
            href={shop.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl flex items-center gap-1.5 w-fit shadow transition-all"
          >
            Open in Google Maps App <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
          <iframe
            title="Shop Location Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(shop.name + ', ' + shop.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            className="w-full h-full rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
}
