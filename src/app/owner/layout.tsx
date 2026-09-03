'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Receipt,
  TrendingUp,
  PiggyBank,
  Wallet,
  PieChart,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Store,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useData } from '@/context/data-context';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { shop, isOwnerLoggedIn, logoutOwner, lowStockProducts, orders, isLoaded } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Redirect to login if not logged in on owner pages (only AFTER initial storage load completes)
  useEffect(() => {
    if (isLoaded && !isOwnerLoggedIn && pathname !== '/owner/login') {
      router.push('/owner/login');
    }
  }, [isLoaded, isOwnerLoggedIn, pathname, router]);

  if (pathname === '/owner/login') {
    return <>{children}</>;
  }

  // Prevent transient flashing or kickouts while initial storage is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 font-mono text-xs gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Verifying Owner Portal Session...
      </div>
    );
  }

  const pendingOrdersCount = orders.filter((o) => o.order_status === 'Pending').length;
  const totalNotifications = lowStockProducts.length + pendingOrdersCount;

  const handleLogout = () => {
    logoutOwner();
    router.push('/owner/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/owner/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/owner/products', icon: Package },
    { name: 'Stock Management', href: '/owner/stock', icon: Layers, badge: lowStockProducts.length },
    { name: 'Order Management', href: '/owner/orders', icon: ShoppingBag, badge: pendingOrdersCount },
    { name: 'POS Billing', href: '/owner/billing', icon: Receipt },
    { name: 'Sales Analytics', href: '/owner/sales', icon: TrendingUp },
    { name: 'Investments', href: '/owner/investments', icon: PiggyBank },
    { name: 'Expenses', href: '/owner/expenses', icon: Wallet },
    { name: 'Profit Analytics', href: '/owner/profit', icon: PieChart },
    { name: 'Shop Settings', href: '/owner/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Branding Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800">
            <Link href="/owner/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black shadow-md">
                <Store className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-extrabold text-sm text-white truncate">{shop.name}</h2>
                <span className="text-[10px] text-emerald-400 font-semibold block">Owner Dashboard</span>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links List */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-extrabold rounded-full px-2 py-0.5 ${
                        item.href === '/owner/stock'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-500 text-slate-950'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer User Info & Logout */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
                OW
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">Shop Administrator</p>
                <p className="text-[10px] text-slate-400 truncate">{shop.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
              <Link
                href="/"
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 p-2 rounded-xl text-xs font-semibold"
                title="View Storefront"
              >
                <Store className="w-4 h-4 text-emerald-400" />
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-slate-900 border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white hidden sm:block">
              {navItems.find((n) => n.href === pathname)?.name || 'Owner Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Drawer Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <Bell className="w-4 h-4" />
                {totalNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {totalNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Modal Popup */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-xs text-white">Notifications ({totalNotifications})</h4>
                    <button onClick={() => setNotificationsOpen(false)} className="text-[10px] text-slate-400 hover:text-white">
                      Close
                    </button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {lowStockProducts.map((p) => (
                      <Link
                        key={p.id}
                        href="/owner/stock"
                        onClick={() => setNotificationsOpen(false)}
                        className="block bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-xs space-y-0.5 hover:bg-amber-500/20"
                      >
                        <p className="font-bold text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Alert
                        </p>
                        <p className="text-slate-300 font-semibold">{p.name}</p>
                        <p className="text-[10px] text-slate-400">Only {p.stock_quantity} items remaining!</p>
                      </Link>
                    ))}

                    {pendingOrdersCount > 0 && (
                      <Link
                        href="/owner/orders"
                        onClick={() => setNotificationsOpen(false)}
                        className="block bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-xs space-y-0.5 hover:bg-emerald-500/20"
                      >
                        <p className="font-bold text-emerald-400">🛍️ {pendingOrdersCount} Pending Customer Orders</p>
                        <p className="text-[10px] text-slate-400">Click to view and update order status</p>
                      </Link>
                    )}

                    {totalNotifications === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">No pending alerts right now.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/"
              className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Store className="w-4 h-4" /> Storefront
            </Link>
          </div>
        </header>

        {/* Dynamic Page Children */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
