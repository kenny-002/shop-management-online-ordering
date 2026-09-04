'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  Menu,
  X,
  Store,
  Package,
} from 'lucide-react';
import { useData } from '@/context/data-context';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const { shop, cart, isOwnerLoggedIn, currentCustomer } = useData();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: Store },
    { name: 'Products', href: '/products', icon: ShoppingBag },
    { name: 'My Orders', href: '/my-orders', icon: Package },
    { name: 'Shop Location', href: '/shop-info', icon: MapPin },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white text-xs py-2 px-3 text-center font-medium shadow-md flex flex-wrap items-center justify-center gap-x-3 gap-y-1 w-full max-w-[100vw]">
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> {shop.opening_hours}
        </span>
        <span className="hidden md:inline">|</span>
        <span className="hidden md:flex items-center gap-1.5">
          <MapPin className="w-4 h-4" /> Free Delivery above ₹{shop.minimum_order}!
        </span>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 md:gap-3 lg:gap-4 xl:gap-5 w-full box-border min-w-0">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Store className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="shrink-0">
              <span className="font-extrabold text-sm sm:text-base lg:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent block">
                {shop.name}
              </span>
              <span className="hidden sm:block text-[10px] sm:text-xs text-emerald-400 font-medium">
                Local Retail Shop
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar (Clearly visible & responsive) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex relative shrink-0 w-44 lg:w-56 xl:w-72 2xl:w-80">
            <input
              type="text"
              placeholder="Search rice, oils, milk, spices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 sm:h-11 bg-slate-800/90 text-slate-100 placeholder-slate-400 text-xs sm:text-sm rounded-full pl-9 sm:pl-10 pr-4 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner truncate"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 sm:top-3.5 pointer-events-none" />
          </form>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 shrink-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 text-xs xl:text-sm font-semibold transition-colors px-2 py-1 rounded-lg ${
                    isActive ? 'text-emerald-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Cart, Customer Login, & Owner Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-2.5 sm:px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-semibold text-xs sm:text-sm transition-all hover:scale-105 shrink-0"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-emerald-500 text-slate-950 font-extrabold text-[10px] sm:text-xs rounded-full w-4.5 h-4.5 sm:w-5 sm:h-5 flex items-center justify-center animate-pulse shrink-0">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* SEPARATE CUSTOMER LOGIN / ACCOUNT BUTTON */}
            {currentCustomer ? (
              <Link
                href="/account"
                className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
                title={currentCustomer.name}
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span className="max-w-[70px] sm:max-w-[90px] xl:max-w-[120px] truncate">{currentCustomer.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span className="hidden xl:inline">Customer Login</span>
                <span className="xl:hidden">Login</span>
              </Link>
            )}

            {/* SEPARATE OWNER PORTAL BUTTON */}
            <Link
              href={isOwnerLoggedIn ? '/owner/dashboard' : '/owner/login'}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-slate-950 font-black px-2.5 sm:px-3.5 py-2 rounded-xl text-xs transition-transform hover:scale-105 shadow shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden xl:inline">{isOwnerLoggedIn ? 'Owner Dashboard' : 'Owner Portal'}</span>
              <span className="xl:hidden">Owner</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </form>

            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <Link
                href={currentCustomer ? '/account' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-slate-800 text-slate-200 border border-slate-700 py-2.5 px-3 rounded-xl text-xs font-semibold hover:bg-slate-700 transition-colors truncate"
              >
                <User className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{currentCustomer ? currentCustomer.name.split(' ')[0] : 'Customer Login'}</span>
              </Link>
              <Link
                href={isOwnerLoggedIn ? '/owner/dashboard' : '/owner/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs hover:from-emerald-500 hover:to-teal-600 transition-all truncate shadow"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="truncate">{isOwnerLoggedIn ? 'Owner Dashboard' : 'Owner Portal'}</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-sm pt-12 pb-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <Store className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-lg">{shop.name}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">{shop.description}</p>
            <p className="text-xs text-emerald-400 font-medium">✓ 100% Guaranteed Fresh Quality</p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-base">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-emerald-400 transition-colors">
                  Browse All Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-emerald-400 transition-colors">
                  View Cart
                </Link>
              </li>
              <li>
                <Link href="/my-orders" className="hover:text-emerald-400 transition-colors">
                  Track My Orders
                </Link>
              </li>
              <li>
                <Link href="/shop-info" className="hover:text-emerald-400 transition-colors">
                  Shop Hours & Directions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-base">Delivery Info</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              <strong className="text-slate-200">Delivery Areas:</strong> {shop.delivery_areas}
            </p>
            <p className="text-xs text-slate-400 mb-2">
              <strong className="text-slate-200">Delivery Fee:</strong> ₹{shop.delivery_charge}
            </p>
            <p className="text-xs text-slate-400">
              <strong className="text-slate-200">Min Order:</strong> ₹{shop.minimum_order}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-base">Account & Portals</h4>
            <div className="space-y-2 text-xs">
              <Link href="/login" className="block text-slate-300 hover:text-emerald-400 font-semibold">
                👤 Customer Login / Register
              </Link>
              <Link href="/owner/login" className="block text-slate-300 hover:text-emerald-400 font-semibold">
                👨‍💼 Shop Owner Dashboard Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {shop.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-emerald-400 transition-colors">
              Customer Account
            </Link>
            <span>•</span>
            <Link href="/owner/login" className="hover:text-emerald-400 transition-colors">
              Owner Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
