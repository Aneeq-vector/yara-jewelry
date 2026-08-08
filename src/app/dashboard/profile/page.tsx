'use client';

import { useState, useEffect } from 'react';
import { m as motion } from 'framer-motion';
import { User, Check } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';

import { updateUserAction } from '@/app/actions/auth';

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Sync form when user data is loaded/hydrated from server
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name !== undefined ? user.name : prev.name,
        email: user.email !== undefined ? user.email : prev.email,
        phone: user.phone !== undefined ? user.phone : prev.phone,
      }));
    }
  }, [user?.id, user?.name, user?.email, user?.phone]);

  const handleSave = async () => {
    if (!user?.id) return;
    setLoading(true);
    const result = await updateUserAction(user.id, {
      name: form.name,
      phone: form.phone,
    });
    setLoading(false);
    
    if (result.error) {
      alert(result.error);
      return;
    }
    
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
            <label className="font-ui text-xs font-semibold uppercase tracking-wider text-burgundy/50 mb-2 block" htmlFor="name_ecbd6b">Name</label>
            <input id="name_ecbd6b" aria-label="Action" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="font-ui text-xs font-semibold uppercase tracking-wider text-burgundy/50 mb-2 block" htmlFor="email_46875d">Email</label>
            <input id="email_46875d" aria-label="Action" type="email" readOnly value={form.email} className={`${inputClass} opacity-70 cursor-not-allowed bg-black/5`} />
          </div>
          <div>
            <label className="font-ui text-xs font-semibold uppercase tracking-wider text-burgundy/50 mb-2 block" htmlFor="phone_b4bcb3">Phone</label>
            <input id="phone_b4bcb3" aria-label="Action" type="tel" readOnly value={form.phone} className={`${inputClass} opacity-70 cursor-not-allowed bg-black/5`} />
          </div>
        </div>
        <button onClick={handleSave} disabled={loading} className="btn-primary mt-6 flex items-center gap-2">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Saving...</span></>
          ) : saved ? (
            <><Check size={16} className="relative z-10" /><span>Saved!</span></>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </motion.div>
    </>
  );
}
