'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Store, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function OwnerLoginPage() {
  const router = useRouter();
  const { shop, loginOwner } = useData();

  const [email, setEmail] = useState('owner@freshmartlocal.com');
  const [password, setPassword] = useState('owner123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // Simulate auth validation or demo login
    setTimeout(() => {
      loginOwner();
      router.push('/owner/dashboard');
    }, 600);
  };

  const handleQuickDemoLogin = () => {
    loginOwner();
    router.push('/owner/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-emerald-500/20">
              <Store className="w-7 h-7" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">{shop.name}</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-extrabold uppercase">
            <ShieldCheck className="w-3.5 h-3.5" /> Owner Portal Access
          </div>
          <p className="text-xs text-slate-400">Sign in to manage stock, POS billing, orders, and financial profit analytics.</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Owner Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-3.5 rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-102 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : <>Login to Dashboard <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="border-t border-slate-800 pt-6 space-y-3">
            <span className="text-[11px] text-slate-400 text-center block uppercase tracking-wider font-semibold">
              Testing & Demonstration
            </span>
            <button
              onClick={handleQuickDemoLogin}
              className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> 1-Click Instant Demo Login
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-emerald-400 transition-colors">
            ← Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
