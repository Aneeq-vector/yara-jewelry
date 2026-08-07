'use client';

import { useState } from 'react';
import { Save, Shield, Store, CreditCard, Bell } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const TABS = [
  { id: 'store', name: 'Store Details', icon: Store },
  { id: 'security', name: 'Security & Roles', icon: Shield },
  { id: 'payments', name: 'Payment Gateways', icon: CreditCard },
  { id: 'notifications', name: 'Notifications', icon: Bell },
];

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('store');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-burgundy">Settings</h1>
          <p className="text-burgundy/60 font-body text-sm mt-1">Manage your store preferences and admin configurations.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-burgundy text-white px-6 py-2.5 rounded-xl font-ui text-sm font-semibold hover:bg-wine transition-colors shadow-md shadow-burgundy/20 self-start sm:self-auto"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2 flex flex-col">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-ui text-sm transition-colors text-left ${
                  isActive 
                    ? 'bg-burgundy text-white shadow-sm' 
                    : 'text-burgundy/70 hover:bg-rose-gold/10 hover:text-burgundy'
                }`}
              >
                <tab.icon size={18} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm p-6 sm:p-8 min-h-[400px]">
            {activeTab === 'store' && (
              <>
                <h2 className="text-xl font-heading font-bold text-burgundy mb-6">Store Details</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-burgundy font-ui uppercase tracking-wider" htmlFor="storename_9d0dc1">Store Name</label>
                      <input id="storename_9d0dc1" aria-label="Action" 
                        type="text" 
                        defaultValue="Yara Jewelry"
                        className="w-full bg-ivory border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-burgundy font-ui uppercase tracking-wider" htmlFor="contactemail_608854">Contact Email</label>
                      <input id="contactemail_608854" aria-label="Action" 
                        type="email" 
                        defaultValue="contact@yarajewelry.com"
                        className="w-full bg-ivory border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-burgundy font-ui uppercase tracking-wider" htmlFor="storedescription_033c23">Store Description</label>
                    <textarea id="storedescription_033c23" aria-label="Action" 
                      rows={4}
                      defaultValue="Exclusive handcrafted fine jewelry combining traditional artistry with modern elegance."
                      className="w-full bg-ivory border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="space-y-2 pt-4 border-t border-burgundy/5">
                    <h3 className="font-bold text-burgundy font-ui mb-4">Currency & Region</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-burgundy font-ui uppercase tracking-wider text-xs" htmlFor="defaultcurrency_248f74">Default Currency</label>
                        <select id="defaultcurrency_248f74" aria-label="Action" className="w-full bg-ivory border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors cursor-pointer">
                          <option>PKR (Rs.)</option>
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                          <option>GBP (£)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-burgundy font-ui uppercase tracking-wider text-xs" htmlFor="timezone_55d114">Timezone</label>
                        <select id="timezone_55d114" aria-label="Action" className="w-full bg-ivory border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors cursor-pointer">
                          <option>Asia/Karachi (GMT+5)</option>
                          <option>America/New_York (GMT-5)</option>
                          <option>Europe/London (GMT+0)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <h2 className="text-xl font-heading font-bold text-burgundy mb-6">Security & Roles</h2>
                <div className="space-y-4 text-burgundy/70 font-body">
                  <p>Manage administrator access and multi-factor authentication here.</p>
                  <div className="p-4 bg-ivory rounded-xl border border-burgundy/10 text-sm">
                    <strong>Admin Email:</strong> admin@yara.com<br/>
                    <strong>Role:</strong> Super Admin
                  </div>
                  <button className="text-sm font-bold text-burgundy hover:underline mt-2">
                    + Add New Administrator
                  </button>
                </div>
              </>
            )}

            {activeTab === 'payments' && (
              <>
                <h2 className="text-xl font-heading font-bold text-burgundy mb-6">Payment Gateways</h2>
                <div className="space-y-4 text-burgundy/70 font-body">
                  <div className="flex items-center justify-between p-4 bg-ivory rounded-xl border border-burgundy/10">
                    <div>
                      <strong className="text-burgundy block">Stripe</strong>
                      <span className="text-sm">Credit card processing</span>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Connected</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-ivory rounded-xl border border-burgundy/10">
                    <div>
                      <strong className="text-burgundy block">PayPal</strong>
                      <span className="text-sm">Express checkout</span>
                    </div>
                    <button className="px-4 py-2 bg-white border border-burgundy/20 text-burgundy text-sm font-bold rounded-lg hover:bg-rose-gold/10 transition-colors">Connect</button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <h2 className="text-xl font-heading font-bold text-burgundy mb-6">Notifications</h2>
                <div className="space-y-4 text-burgundy/70 font-body">
                  <label className="flex items-center gap-3 p-4 bg-ivory rounded-xl border border-burgundy/10 cursor-pointer hover:bg-rose-gold/10 transition-colors">
                    <Checkbox defaultChecked className="w-4 h-4 rounded border-burgundy/20 text-burgundy focus:ring-burgundy" />
                    <div>
                      <strong className="text-burgundy block text-sm">New Order Alerts</strong>
                      <span className="text-xs">Receive an email when a new order is placed.</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-ivory rounded-xl border border-burgundy/10 cursor-pointer hover:bg-rose-gold/10 transition-colors">
                    <Checkbox defaultChecked className="w-4 h-4 rounded border-burgundy/20 text-burgundy focus:ring-burgundy" />
                    <div>
                      <strong className="text-burgundy block text-sm">Low Stock Alerts</strong>
                      <span className="text-xs">Receive an email when inventory falls below 5 items.</span>
                    </div>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
