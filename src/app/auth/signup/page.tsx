'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';

import { registerAction } from '@/app/actions/auth';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const updateForm = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('password', form.password);
      formData.append('passwordConfirm', form.confirmPassword);

      const result = await registerAction(formData);
      
      if (result.error) {
        alert(result.error);
        return;
      }
      
      // Sync client state
      useAuthStore.setState({ user: result.user as any, isAuthenticated: true });
      
      // Sync wishlist
      try {
        const { syncWishlistAction } = await import('@/app/actions/wishlist');
        const { useWishlistStore } = await import('@/lib/store/wishlist-store');
        const localItems = useWishlistStore.getState().items.map(i => i.id);
        const syncRes = await syncWishlistAction(localItems);
        if (syncRes.success && syncRes.items) {
          useWishlistStore.getState().setWishlist(syncRes.items);
        }
      } catch (e) {
        console.error('Failed to sync wishlist on signup', e);
      }
      
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-champagne/60 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-gold/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-[540px] mt-6 sm:mt-8 pb-12">
        {/* Large Logo */}
        <m.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center -mb-4 -mt-10 relative z-20"
        >
          <Link href="/">
            <Image 
              src="/images/yara-logo.png" 
              alt="Yara" 
              width={400} 
              height={160} 
              className="h-28 sm:h-36 w-auto hover:scale-105 transition-transform duration-500" 
              priority
            />
          </Link>
        </m.div>

        {/* Glass Card Form */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/50 p-8 sm:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.04)]"
        >
          <AnimatePresence mode="wait">
            {!success ? (
              <m.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="text-center mb-10">
                  <h1 className="font-heading text-3xl font-bold text-burgundy mb-2">Create Account</h1>
                  <p className="font-body text-burgundy/50">Join us and discover premium elegance.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="relative pt-5">
                      <input type="text" id="name" value={form.name} onChange={(e) => updateForm('name', e.target.value)} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} className="peer w-full bg-transparent border-b-2 border-burgundy/10 px-0 py-2 text-burgundy font-body focus:border-burgundy focus:outline-none transition-colors placeholder-transparent" placeholder="Full Name" required />
                      <label htmlFor="name" className={`absolute left-0 font-ui transition duration-200 pointer-events-none ${focused === 'name' || form.name ? 'top-0 text-xs text-burgundy uppercase font-bold tracking-wider' : 'top-7 text-sm text-burgundy/50'}`}>Full Name</label>
                    </div>

                    {/* Phone */}
                    <div className="relative pt-5">
                      <input type="tel" id="phone" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} className="peer w-full bg-transparent border-b-2 border-burgundy/10 px-0 py-2 text-burgundy font-body focus:border-burgundy focus:outline-none transition-colors placeholder-transparent" placeholder="Phone Number" required />
                      <label htmlFor="phone" className={`absolute left-0 font-ui transition duration-200 pointer-events-none ${focused === 'phone' || form.phone ? 'top-0 text-xs text-burgundy uppercase font-bold tracking-wider' : 'top-7 text-sm text-burgundy/50'}`}>Phone Number</label>
                    </div>

                  {/* Email */}
                  <div className="relative pt-5">
                    <input type="email" id="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} className="peer w-full bg-transparent border-b-2 border-burgundy/10 px-0 py-2 text-burgundy font-body focus:border-burgundy focus:outline-none transition-colors placeholder-transparent" placeholder="Email Address" required />
                    <label htmlFor="email" className={`absolute left-0 font-ui transition duration-200 pointer-events-none ${focused === 'email' || form.email ? 'top-0 text-xs text-burgundy uppercase font-bold tracking-wider' : 'top-7 text-sm text-burgundy/50'}`}>Email Address</label>
                  </div>

                    {/* Password */}
                    <div className="relative pt-5">
                      <input type={showPassword ? 'text' : 'password'} id="password" value={form.password} onChange={(e) => updateForm('password', e.target.value)} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} className="peer w-full bg-transparent border-b-2 border-burgundy/10 px-0 py-2 pr-10 text-burgundy font-body focus:border-burgundy focus:outline-none transition-colors placeholder-transparent" placeholder="Password" required />
                      <label htmlFor="password" className={`absolute left-0 font-ui transition duration-200 pointer-events-none ${focused === 'password' || form.password ? 'top-0 text-xs text-burgundy uppercase font-bold tracking-wider' : 'top-7 text-sm text-burgundy/50'}`}>Password</label>
                      <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-7 text-burgundy/30 hover:text-burgundy/60 transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative pt-5">
                      <input type="password" id="confirmPassword" value={form.confirmPassword} onChange={(e) => updateForm('confirmPassword', e.target.value)} onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)} className="peer w-full bg-transparent border-b-2 border-burgundy/10 px-0 py-2 text-burgundy font-body focus:border-burgundy focus:outline-none transition-colors placeholder-transparent" placeholder="Confirm Password" required />
                      <label htmlFor="confirmPassword" className={`absolute left-0 font-ui transition duration-200 pointer-events-none ${focused === 'confirm' || form.confirmPassword ? 'top-0 text-xs text-burgundy uppercase font-bold tracking-wider' : 'top-7 text-sm text-burgundy/50'}`}>Confirm Password</label>
                    </div>
                  {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="font-body text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}

                  <m.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || (form.password !== form.confirmPassword && form.confirmPassword !== '')}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-burgundy text-ivory font-ui text-xs font-bold uppercase tracking-wider hover:bg-wine transition-colors disabled:opacity-60 mt-8 shadow-xl shadow-burgundy/20"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin relative z-10" />
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight size={16} className="relative z-10" />
                      </>
                    )}
                  </m.button>
                </form>

                <p className="text-center mt-10 font-body text-sm text-burgundy/50">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-semibold text-burgundy hover:text-wine transition-colors border-b border-burgundy/30 pb-0.5 hover:border-wine">
                    Sign In
                  </Link>
                </p>
              </m.div>
            ) : (
              <m.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <m.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                  className="w-24 h-24 rounded-full gradient-rose-gold flex items-center justify-center mx-auto mb-6"
                >
                  <Sparkles size={40} className="text-white" />
                </m.div>
                <h2 className="font-heading text-3xl font-bold text-burgundy mb-3">Welcome to Yara! ✨</h2>
                <p className="font-body text-burgundy/50">Your account has been created. Redirecting you to your dashboard...</p>
              </m.div>
            )}
          </AnimatePresence>
        </m.div>
      </div>
    </div>
  );
}
