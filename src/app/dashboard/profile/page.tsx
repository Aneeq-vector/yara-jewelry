'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Check } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSave = () => {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass = "w-full px-4 py-3.5 rounded-2xl bg-transparent border border-burgundy/20 font-body text-sm text-burgundy placeholder:text-burgundy/50 focus:outline-none focus:border-burgundy transition-colors";

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-burgundy">Profile</h1>
        <p className="font-body text-burgundy/50 mt-2">Manage your personal information.</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <User size={18} className="text-rose-gold" />
          <h2 className="font-heading text-xl font-bold text-burgundy">Profile Information</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="font-ui text-xs font-semibold uppercase tracking-wider text-burgundy/50 mb-2 block">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="font-ui text-xs font-semibold uppercase tracking-wider text-burgundy/50 mb-2 block">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="font-ui text-xs font-semibold uppercase tracking-wider text-burgundy/50 mb-2 block">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
          </div>
        </div>
        <button onClick={handleSave} className="btn-primary mt-6 flex items-center gap-2">
          {saved ? <><Check size={16} className="relative z-10" /><span>Saved!</span></> : <span>Save Changes</span>}
        </button>
      </motion.div>
    </>
  );
}
