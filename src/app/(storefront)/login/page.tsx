'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Store,
  ArrowRight,
  Mail,
  Phone,
  Lock,
  MapPin,
  UserPlus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useData } from '@/context/data-context';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { shop, registerCustomer, authenticateCustomer, registeredCustomers } = useData();

  // Customer Mode: 'login' | 'register'
  const [customerMode, setCustomerMode] = useState<'login' | 'register'>('login');

  // Customer Form Fields
  const [custName, setCustName] = useState('');
  const [custEmailOrPhone, setCustEmailOrPhone] = useState('');
  const [custRegisterEmail, setCustRegisterEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custPassword, setCustPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'NOT_REGISTERED' | 'INVALID_PASSWORD' | 'ALREADY_EXISTS' | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Submit Handlers
  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setErrorType(null);
    setSuccessNotice(null);

    if (!custEmailOrPhone.trim()) {
      setErrorNotice('Please enter your registered email or mobile number.');
      return;
    }
    if (!custPassword) {
      setErrorNotice('Please enter your password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const res = authenticateCustomer(custEmailOrPhone, custPassword);

      if (!res.success) {
        if (res.reason === 'NOT_REGISTERED') {
          setErrorType('NOT_REGISTERED');
          setErrorNotice(
            `Account not registered! We could not find any customer account for "${custEmailOrPhone}". Please register first.`
          );
        } else if (res.reason === 'INVALID_PASSWORD') {
          setErrorType('INVALID_PASSWORD');
          setErrorNotice('Incorrect password! The password you entered does not match your registered account.');
        }
      } else {
        setSuccessNotice(`Welcome back, ${res.customer?.name}! Logged in successfully. Redirecting...`);
        setTimeout(() => router.push('/products'), 800);
      }
    }, 400);
  };

  const handleCustomerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setErrorType(null);
    setSuccessNotice(null);

    const emailToUse = custRegisterEmail.trim().toLowerCase();
    const phoneToUse = custPhone.trim();

    // Check if account already exists
    const existing = registeredCustomers.find(
      (c) => c.email.trim().toLowerCase() === emailToUse || c.phone.replace(/\D/g, '') === phoneToUse.replace(/\D/g, '')
    );

    if (existing) {
      setErrorType('ALREADY_EXISTS');
      setErrorNotice(`An account already exists for "${emailToUse || phoneToUse}". Please log in instead.`);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      registerCustomer({
        name: custName.trim() || 'Valued Customer',
        email: emailToUse || 'customer@example.com',
        phone: phoneToUse || '+91 98765 00000',
        address: custAddress.trim() || 'Green Park, Sector 4',
        area: 'Sector 4',
        city: 'New Delhi',
        pincode: '110016',
        password: custPassword,
      });

      setSuccessNotice('Account registered successfully! Redirecting to shop...');
      setTimeout(() => router.push('/products'), 800);
    }, 400);
  };

  const switchToRegister = () => {
    if (custEmailOrPhone.includes('@')) {
      setCustRegisterEmail(custEmailOrPhone);
    } else {
      setCustPhone(custEmailOrPhone);
    }
    setErrorNotice(null);
    setErrorType(null);
    setCustomerMode('register');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8 min-h-[70vh] flex flex-col justify-center">
      {/* Header Branding */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <User className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">{shop.name}</span>
        </Link>
        <h1 className="text-xl font-extrabold text-white">Customer Portal Authentication</h1>
        <p className="text-xs text-slate-400">Enter your credentials to log in or register a new customer account.</p>
      </div>

      {/* ERROR NOTICE DISPLAY */}
      {errorNotice && (
        <div className="bg-red-950/80 border border-red-500/50 text-red-300 p-4 rounded-2xl text-xs font-bold space-y-2 shadow-xl animate-shake">
          <div className="flex items-start gap-2.5">
            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-black text-red-200 text-sm">
                {errorType === 'NOT_REGISTERED'
                  ? 'Account Not Registered'
                  : errorType === 'INVALID_PASSWORD'
                  ? 'Password Does Not Match'
                  : 'Authentication Error'}
              </p>
              <p className="text-red-300 leading-relaxed">{errorNotice}</p>
            </div>
          </div>

          {errorType === 'NOT_REGISTERED' && (
            <button
              onClick={switchToRegister}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
            >
              <UserPlus className="w-4 h-4" /> Click Here to Register This Account First →
            </button>
          )}

          {errorType === 'ALREADY_EXISTS' && (
            <button
              onClick={() => {
                setCustomerMode('login');
                setErrorNotice(null);
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
            >
              Switch to Login Form →
            </button>
          )}
        </div>
      )}

      {/* SUCCESS NOTICE DISPLAY */}
      {successNotice && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 p-4 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 shrink-0" /> {successNotice}
        </div>
      )}

      {/* CUSTOMER LOGIN & REGISTRATION CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Customer Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => {
              setCustomerMode('login');
              setErrorNotice(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-extrabold transition-all ${
              customerMode === 'login'
                ? 'bg-emerald-600 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Customer Login
          </button>
          <button
            onClick={() => {
              setCustomerMode('register');
              setErrorNotice(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-extrabold transition-all ${
              customerMode === 'register'
                ? 'bg-emerald-600 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Account First
          </button>
        </div>

        {/* FORM 1: CUSTOMER LOGIN */}
        {customerMode === 'login' ? (
          <form onSubmit={handleCustomerLogin} className="space-y-4 text-xs" autoComplete="off">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Registered Mobile Number or Email *</label>
              <div className="relative">
                <input
                  type="text"
                  name="customer_login_identifier_no_autofill"
                  autoComplete="off"
                  required
                  placeholder="e.g. customer@example.com or +91 98765 12345"
                  value={custEmailOrPhone}
                  onChange={(e) => setCustEmailOrPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Password *</label>
              <div className="relative">
                <input
                  type="password"
                  name="customer_login_password_no_autofill"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  value={custPassword}
                  onChange={(e) => setCustPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 text-xs flex items-center justify-center gap-2 transition-all hover:scale-102 disabled:opacity-50"
            >
              {loading ? 'Verifying Account & Password...' : <>Login to Customer Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          /* FORM 2: CUSTOMER REGISTRATION FIRST */
          <form onSubmit={handleCustomerRegister} className="space-y-4 text-xs">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl text-[11px] text-emerald-300 font-semibold flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Register your account once to enjoy express checkout and digital bill delivery.</span>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Mobile Phone Number *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number (+91 9876543210)"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={custRegisterEmail}
                  onChange={(e) => setCustRegisterEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Default Delivery Address *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="House / Flat / Street address"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Create Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={custPassword}
                  onChange={(e) => setCustPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 text-xs flex items-center justify-center gap-2 transition-all hover:scale-102 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : <>Register Account & Continue <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

      </div>

      {/* DISTINCT OWNER PORTAL NAVIGATION LINK */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
        <p className="text-xs text-slate-400">Are you the Shop Owner?</p>
        <Link
          href="/owner/login"
          className="text-xs font-bold text-emerald-400 hover:underline flex items-center justify-center gap-1"
        >
          <Store className="w-3.5 h-3.5" /> Go to Owner Portal Login →
        </Link>
      </div>
    </div>
  );
}
