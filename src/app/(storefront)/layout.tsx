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
import { ThemeToggle } from '@/components/theme-toggle';

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
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium shadow-md flex items-center justify-center gap-4">
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> {shop.opening_hours}
        </span>
        <span className="hidden md:inline">|</span>
        <span className="hidden md:flex items-center gap-1.5">
          <MapPin className="w-4 h-4" /> Free Delivery above ₹{shop.minimum_order}!
        </span>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-lg transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg lg:text-xl tracking-tight text-slate-900 dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-emerald-400 dark:bg-clip-text dark:text-transparent">
                {shop.name}
              </span>
              <span className="block text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Local Retail Shop</span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xs lg:max-w-md relative">
            <input
              type="text"
              placeholder="Search rice, oils, milk, spices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 text-sm rounded-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3.5 top-3" />
          </form>

          {/* Nav Links & Actions */}
          <nav className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle, Cart, Customer Login, & Owner Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Toggle (Desktop & Tablet) */}
            <ThemeToggle className="hidden sm:inline-flex" />

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative bg-emerald-100 dark:bg-emerald-600/20 hover:bg-emerald-200 dark:hover:bg-emerald-600/30 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 px-3 py-2 rounded-xl flex items-center gap-2 font-semibold text-xs sm:text-sm transition-all hover:scale-105"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-emerald-500 text-slate-950 font-extrabold text-[10px] sm:text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* CUSTOMER LOGIN / ACCOUNT BUTTON */}
            {currentCustomer ? (
              <Link
                href="/account"
                className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="max-w-[80px] lg:max-w-[100px] truncate">{currentCustomer.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Login
              </Link>
            )}

            {/* OWNER PORTAL BUTTON */}
            <Link
              href={isOwnerLoggedIn ? '/owner/dashboard' : '/owner/login'}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white dark:text-slate-950 font-extrabold px-3 py-2 rounded-xl text-xs transition-transform hover:scale-105 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              {isOwnerLoggedIn ? 'Owner' : 'Owner Portal'}
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-4 shadow-xl">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 border-none" />
            </form>

            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 p-3 rounded-xl text-sm font-medium border border-slate-200/80 dark:border-slate-700/50"
                  >
                    <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Theme Toggle row in Mobile Drawer */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Theme Appearance</span>
              <ThemeToggle showLabel />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Link
                href={currentCustomer ? '/account' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 py-2.5 rounded-xl text-xs font-semibold"
              >
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {currentCustomer ? 'My Profile' : 'Customer Login'}
              </Link>
              <Link
                href={isOwnerLoggedIn ? '/owner/dashboard' : '/owner/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold py-2.5 rounded-xl text-xs shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                Owner Portal
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm pt-12 pb-8 mt-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-lg">{shop.name}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{shop.description}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ 100% Guaranteed Fresh Quality</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-base">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Browse All Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  View Cart
                </Link>
              </li>
              <li>
                <Link href="/my-orders" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Track My Orders
                </Link>
              </li>
              <li>
                <Link href="/shop-info" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Shop Hours & Directions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-base">Delivery Info</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
              <strong className="text-slate-800 dark:text-slate-200">Delivery Areas:</strong> {shop.delivery_areas}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              <strong className="text-slate-800 dark:text-slate-200">Delivery Fee:</strong> ₹{shop.delivery_charge}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <strong className="text-slate-800 dark:text-slate-200">Min Order:</strong> ₹{shop.minimum_order}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-base">Account & Portals</h4>
            <div className="space-y-2 text-xs">
              <Link href="/login" className="block text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold">
                👤 Customer Login / Register
              </Link>
              <Link href="/owner/login" className="block text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold">
                👨‍💼 Shop Owner Dashboard Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {shop.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Customer Account
            </Link>
            <span>•</span>
            <Link href="/owner/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Owner Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
