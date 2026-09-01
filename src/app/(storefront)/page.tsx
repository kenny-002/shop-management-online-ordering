'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  Zap,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Star,
  Store,
} from 'lucide-react';
import { useData, Product } from '@/context/data-context';

export default function HomePage() {
  const { shop, categories, products, addToCart } = useData();
  const [addedId, setAddedId] = useState<string | null>(null);

  const featuredProducts = products.slice(0, 8);
  const inStockProducts = products.filter((p) => p.stock_quantity > 0).slice(0, 8);

  const handleAddToCart = (prod: Product) => {
    addToCart(prod, 1);
    setAddedId(prod.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const shopPhotos = [
    { url: '/images/shop/sri-samundi-store-front.jpg', caption: 'Sri Samundi Store Entrance & Ice Creams' },
    { url: '/images/shop/sri-samundi-biscuits-snacks.jpg', caption: 'Snacks, Biscuits & Rusk Displays' },
    { url: '/images/shop/sri-samundi-store-inside.jpg', caption: 'Store Interior & Household Essentials' },
    { url: '/images/shop/sri-samundi-board-sign.jpg', caption: 'Official MilkyMist Sri Samundi Storeboard' },
    { url: '/images/shop/sri-samundi-counter-display.jpg', caption: 'Tea Stall Counter & Payment Desk' },
  ];

  return (
    <div className="space-y-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 pt-12 pb-20 border-b border-slate-800">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
              <Zap className="w-3.5 h-3.5" /> Order Online • Express Home Delivery
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Your Local Shop, <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                Now Online
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Explore available stock, compare transparent prices, and order fresh groceries directly from{' '}
              <strong className="text-white font-semibold">{shop.name}</strong> with home delivery or quick pickup!
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/products"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-105"
              >
                <ShoppingBag className="w-5 h-5" /> Shop Products
              </Link>
              <Link
                href="/products"
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
              >
                Order Now <ArrowRight className="w-4 h-4 text-emerald-400" />
              </Link>
              <Link
                href="/shop-info"
                className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold px-5 py-3.5 rounded-xl border border-slate-800 flex items-center gap-2 transition-colors text-sm"
              >
                <MapPin className="w-4 h-4 text-slate-400" /> View Location
              </Link>
            </div>

            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Live Stock Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Doorstep Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant UPI Payment</span>
              </div>
            </div>
          </div>

          {/* Hero Store Showcase Card */}
          <div className="relative">
            <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-900/90 group">
              <img
                src={shop.logo_url}
                alt={shop.name}
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
                <span className="bg-emerald-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full w-fit mb-2">
                  Open Today • {shop.opening_hours.split('|')[0]}
                </span>
                <h3 className="text-2xl font-bold text-white">{shop.name}</h3>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {shop.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP INTRODUCTION & QUICK METRICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="space-y-3 md:col-span-2">
            <span className="text-emerald-400 font-bold text-xs tracking-wider uppercase">Welcome To Our Shop</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Fresh Everyday • Direct From Local Counters To Your Door
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {shop.description} Check item availability live, view real-time stock levels, and order directly online with no phone call hassles!
            </p>
          </div>
          <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 space-y-4 text-center">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">Home Delivery Available</h4>
            <p className="text-xs text-slate-400">
              Delivery Fee: ₹{shop.delivery_charge} | Min Order: ₹{shop.minimum_order}
            </p>
            <Link
              href="/products"
              className="inline-block w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Order Online Now
            </Link>
          </div>
        </div>
      </section>

      {/* PRODUCT CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Browse Categories</h2>
            <p className="text-xs text-slate-400 mt-1">Explore our wide selection of groceries & essentials</p>
          </div>
          <Link href="/products" className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${encodeURIComponent(cat.id)}`}
              className="group bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-2xl text-center transition-all hover:-translate-y-1 shadow-md"
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl overflow-hidden relative border border-slate-700/50">
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-emerald-400 line-clamp-1">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Products</h2>
            <p className="text-xs text-slate-400 mt-1">Top picked grocery essentials and customer favorites</p>
          </div>
          <Link href="/products" className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1">
            See All Products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => {
            const isOutOfStock = prod.stock_quantity <= 0;
            return (
              <div
                key={prod.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl group"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-950">
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isOutOfStock ? (
                    <span className="absolute top-3 left-3 bg-red-500/90 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="absolute top-3 left-3 bg-emerald-500/90 text-slate-950 font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow">
                      {prod.stock_quantity} In Stock
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">{prod.brand}</span>
                    <Link href={`/products/${prod.id}`}>
                      <h3 className="font-bold text-sm text-slate-100 hover:text-emerald-400 transition-colors line-clamp-1 mt-0.5">
                        {prod.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{prod.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-xs text-slate-400">Price</span>
                      <p className="text-lg font-black text-white">₹{prod.selling_price}</p>
                    </div>

                    <button
                      onClick={() => handleAddToCart(prod)}
                      disabled={isOutOfStock}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isOutOfStock
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : addedId === prod.id
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 hover:scale-105'
                      }`}
                    >
                      {addedId === prod.id ? (
                        <>✓ Added</>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PRODUCTS CURRENTLY IN STOCK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Live Inventory</span>
              <h2 className="text-2xl font-bold text-white">Ready for Delivery Today</h2>
            </div>
            <Link href="/products?inStock=true" className="text-xs text-emerald-400 font-semibold hover:underline">
              View All In-Stock ({products.filter((p) => p.stock_quantity > 0).length})
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {inStockProducts.map((prod) => (
              <div key={prod.id} className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 flex items-center gap-3">
                <img src={prod.image_url} alt={prod.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-xs text-white truncate">{prod.name}</h4>
                  <p className="text-xs text-emerald-400 font-bold mt-0.5">₹{prod.selling_price}</p>
                  <span className="text-[10px] text-slate-400">{prod.stock_quantity} available</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white">Why Shop With Us?</h2>
          <p className="text-slate-400 text-sm mt-2">Combining the trust of your neighborhood retail shop with modern online convenience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Real-Time Stock Clarity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never guess if an item is available. Live stock counts are updated directly from the shop owner&apos;s register.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Fast Local Home Delivery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Order directly to your house in your local neighborhood with express delivery options.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Scan & Pay UPI Payment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pay securely using Google Pay, PhonePe, Paytm or BHIM UPI by scanning the shop&apos;s official QR code.
            </p>
          </div>
        </div>
      </section>

      {/* SHOP GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Shop Gallery</h2>
          <p className="text-xs text-slate-400 mt-1">Take a look inside our clean physical retail store</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {shopPhotos.map((photo, i) => (
            <div key={i} className="group relative rounded-2xl overflow-hidden aspect-video border border-slate-800 bg-slate-900">
              <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-semibold text-white">{photo.caption}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LOCATION MAP & CONTACT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Visit Our Physical Store</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Located in the Heart of Your Market</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{shop.address}</p>

            <div className="space-y-2 text-xs text-slate-300 pt-2">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" /> <strong className="text-white">Phone:</strong> {shop.phone}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" /> <strong className="text-white">Hours:</strong> {shop.opening_hours}
              </p>
            </div>

            <div className="pt-4">
              <a
                href={shop.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition-colors"
              >
                <MapPin className="w-4 h-4" /> Get Directions on Google Maps
              </a>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 min-h-[300px] flex flex-col shadow-inner">
            <iframe
              title="Shop Location Map"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '300px' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(shop.name + ', ' + shop.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full min-h-[300px] rounded-2xl"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
