'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    orders: true,
    promotions: true,
    newArrivals: false,
  });

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-burgundy">Settings</h1>
        <p className="font-body text-burgundy/50 mt-2">Manage your account preferences and notifications.</p>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Bell size={18} className="text-rose-gold" />
          <h2 className="font-heading text-xl font-bold text-burgundy">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { key: 'orders' as const, label: 'Order Updates', description: 'Get notified about shipping and delivery' },
            { key: 'promotions' as const, label: 'Promotions', description: 'Receive exclusive deals and offers' },
            { key: 'newArrivals' as const, label: 'New Arrivals', description: 'Be first to know about new collections' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-nude/20 last:border-0">
              <div>
                <p className="font-ui font-semibold text-sm text-burgundy">{item.label}</p>
                <p className="font-body text-xs text-burgundy/40">{item.description}</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  notifications[item.key] ? 'bg-rose-gold' : 'bg-nude/50'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  notifications[item.key] ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
