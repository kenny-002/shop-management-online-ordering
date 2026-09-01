'use client';

import React, { useState } from 'react';
import { Settings, Save, QrCode, Truck, Store, MapPin, Check, Smartphone, Key, Bell, FileText, ExternalLink } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function OwnerSettingsPage() {
  const { shop, updateShopSettings } = useData();

  const [name, setName] = useState(shop.name);
  const [description, setDescription] = useState(shop.description);
  const [logoUrl, setLogoUrl] = useState(shop.logo_url);
  const [address, setAddress] = useState(shop.address);
  const [phone, setPhone] = useState(shop.phone);
  const [email, setEmail] = useState(shop.email);
  const [openingHours, setOpeningHours] = useState(shop.opening_hours);
  const [googleMapsUrl, setGoogleMapsUrl] = useState(shop.google_maps_url || 'https://maps.app.goo.gl/92QnYifkpxdVkEv27');

  // Delivery Settings
  const [deliveryEnabled, setDeliveryEnabled] = useState(shop.delivery_enabled);
  const [deliveryCharge, setDeliveryCharge] = useState(shop.delivery_charge);
  const [minimumOrder, setMinimumOrder] = useState(shop.minimum_order);
  const [deliveryAreas, setDeliveryAreas] = useState(shop.delivery_areas);

  // Payment QR Settings
  const [upiId, setUpiId] = useState(shop.upi_id);
  const [qrCodeUrl, setQrCodeUrl] = useState(shop.qr_code_url);

  // Bill & Notification Settings
  const [autoGenerateBill, setAutoGenerateBill] = useState(shop.auto_generate_bill ?? true);
  const [autoSendBill, setAutoSendBill] = useState(shop.auto_send_bill ?? true);
  const [preferredDeliveryMethod, setPreferredDeliveryMethod] = useState<'WHATSAPP' | 'SMS' | 'BOTH'>(
    shop.preferred_delivery_method || 'WHATSAPP'
  );
  const [invoicePrefix, setInvoicePrefix] = useState(shop.invoice_prefix || 'INV-');
  const [messageTemplate, setMessageTemplate] = useState(
    shop.message_template ||
      'Thank you for shopping with [SHOP NAME]. Your order #[ORDER_NO] has been completed. Total Amount: ₹[AMOUNT]. Your digital invoice is ready: [INVOICE_LINK]'
  );

  // API Credentials
  const [smsApiKey, setSmsApiKey] = useState(shop.sms_api_key || '');
  const [whatsappApiKey, setWhatsappApiKey] = useState(shop.whatsapp_api_key || '');

  // Test SMS State
  const [testPhone, setTestPhone] = useState('');
  const [testSmsLoading, setTestSmsLoading] = useState(false);
  const [testSmsResult, setTestSmsResult] = useState<{ success: boolean; message: string } | null>(null);

  const [savedNotice, setSavedNotice] = useState(false);

  const handleTestSms = async () => {
    if (!testPhone || testPhone.trim().length < 10) {
      setTestSmsResult({ success: false, message: 'Please enter a valid 10-digit mobile number' });
      return;
    }
    setTestSmsLoading(true);
    setTestSmsResult(null);
    try {
      const res = await fetch('/api/notifications/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone: testPhone,
          apiKey: smsApiKey,
          provider: 'fast2sms',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestSmsResult({ success: true, message: data.message });
      } else {
        setTestSmsResult({ success: false, message: data.error || 'SMS Dispatch Failed' });
      }
    } catch (err: unknown) {
      setTestSmsResult({
        success: false,
        message: err instanceof Error ? err.message : 'Network error testing SMS',
      });
    } finally {
      setTestSmsLoading(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateShopSettings({
      name,
      description,
      logo_url: logoUrl,
      address,
      phone,
      email,
      opening_hours: openingHours,
      google_maps_url: googleMapsUrl,
      delivery_enabled: deliveryEnabled,
      delivery_charge: Number(deliveryCharge),
      minimum_order: Number(minimumOrder),
      delivery_areas: deliveryAreas,
      upi_id: upiId,
      qr_code_url: qrCodeUrl,
      auto_generate_bill: autoGenerateBill,
      auto_send_bill: autoSendBill,
      preferred_delivery_method: preferredDeliveryMethod,
      invoice_prefix: invoicePrefix,
      message_template: messageTemplate,
      sms_api_key: smsApiKey,
      whatsapp_api_key: whatsappApiKey,
    });

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Settings → Bill & Store Options</h1>
          <p className="text-xs text-slate-400 mt-1">Configure shop Google Maps location, automatic digital bill delivery, and messaging providers.</p>
        </div>

        {savedNotice && (
          <div className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow">
            <Check className="w-4 h-4" /> Settings Saved!
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* BILL & NOTIFICATIONS CONFIGURATION */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" /> Bill & Mobile Notification Options
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <input
                type="checkbox"
                id="autoGen"
                checked={autoGenerateBill}
                onChange={(e) => setAutoGenerateBill(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <label htmlFor="autoGen" className="font-bold text-white cursor-pointer">
                ☑ Automatically generate digital bill on completion
              </label>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <input
                type="checkbox"
                id="autoSend"
                checked={autoSendBill}
                onChange={(e) => setAutoSendBill(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <label htmlFor="autoSend" className="font-bold text-white cursor-pointer">
                ☑ Automatically send bill to customer mobile number
              </label>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Preferred Delivery Method</label>
              <select
                value={preferredDeliveryMethod}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPreferredDeliveryMethod(e.target.value as 'WHATSAPP' | 'SMS' | 'BOTH')}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 font-bold text-emerald-400"
              >
                <option value="WHATSAPP">○ WhatsApp Business API</option>
                <option value="SMS">○ SMS Provider</option>
                <option value="BOTH">○ Both (WhatsApp with SMS Fallback)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Invoice Number Prefix</label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-300 block mb-1">Customer SMS / WhatsApp Message Template</label>
              <textarea
                rows={3}
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">Available tags: [SHOP NAME], [ORDER_NO], [AMOUNT], [INVOICE_LINK]</p>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Business API Token
              </label>
              <input
                type="password"
                placeholder="Meta Cloud API Token / WhatsApp Key"
                value={whatsappApiKey}
                onChange={(e) => setWhatsappApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-teal-400" /> SMS Provider API Key (Fast2SMS / Twilio)
              </label>
              <input
                type="password"
                placeholder="SMS API Key (Fast2SMS / Twilio)"
                value={smsApiKey}
                onChange={(e) => setSmsApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs font-mono mb-2"
              />

              {/* Real-time SMS Test Tool */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-teal-400" /> Test Live Fast2SMS Dispatch
                  </span>
                  {testSmsResult && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        testSmsResult.success
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {testSmsResult.success ? '✓ Dispatch Succeeded' : '✕ Dispatch Failed'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="Enter 10-digit Mobile No (e.g. 9876543210)"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 font-mono"
                  />
                  <button
                    type="button"
                    disabled={testSmsLoading || !testPhone}
                    onClick={handleTestSms}
                    className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md"
                  >
                    {testSmsLoading ? 'Testing...' : 'Send Test SMS'}
                  </button>
                </div>
                {testSmsResult && (
                  <p
                    className={`text-[11px] font-mono p-2 rounded-lg ${
                      testSmsResult.success
                        ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50'
                        : 'bg-rose-950/50 text-rose-300 border border-rose-800/50'
                    }`}
                  >
                    {testSmsResult.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Store Profile & Location Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-400" /> Store Profile & Google Maps Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-300 block mb-1">Shop Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Official Google Maps Location URL *
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  placeholder="https://maps.app.goo.gl/..."
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-xs rounded-xl px-4 py-2.5 font-bold"
                />
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1 shrink-0"
                >
                  Test Link <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Live link used across Get Directions buttons and Store Location page.</span>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-300 block mb-1">Short Shop Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-300 block mb-1">Full Physical Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5"
              />
            </div>
          </div>
        </div>

        {/* UPI & Payment QR Code Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-400" /> Shop UPI ID & QR Code Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs items-center">
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Shop Official UPI ID *</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 font-mono text-sm font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">QR Code Image URL *</label>
                <input
                  type="url"
                  required
                  value={qrCodeUrl}
                  onChange={(e) => setQrCodeUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-2">
              <span className="text-[10px] text-slate-400 font-bold block">Live QR Preview</span>
              <div className="bg-white p-2 rounded-xl w-36 h-36 mx-auto border flex items-center justify-center">
                <img src={qrCodeUrl} alt="QR Code Preview" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs text-emerald-400 font-bold font-mono block">{upiId}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm transition-all hover:scale-102"
        >
          <Save className="w-5 h-5" /> Save All Shop & Location Settings
        </button>
      </form>
    </div>
  );
}
