'use client';

import { useState } from 'react';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';
import { loginAction, requestPasswordResetAction } from '@/app/actions/auth';
import { useAuthStore } from '@/lib/store/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }
    const confirm = window.confirm(`Send password reset email to ${email}?`);
    if (!confirm) return;
    
    setLoading(true);
    const result = await requestPasswordResetAction(email);
    setLoading(false);
    
    if (result.success) {
      alert("Password reset email sent! Check your inbox.");
    } else {
      alert(result.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('expectedRole', 'customer');
      formData.append('remember', remember ? 'true' : 'false');
      
      const result = await loginAction(formData);
      
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
        console.error('Failed to sync wishlist on login', e);
      }
      
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-ivory flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-champagne/60 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-gold/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-[480px] mt-6 sm:mt-8 pb-12">
        {/* Large Logo */}
        <motion.div 
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
        </motion.div>

        {/* Glass Card Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/50 p-8 sm:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.04)]"
        >
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl font-bold text-burgundy mb-2">Sign In</h1>
            <p className="font-body text-burgundy/50">
              Welcome back to elegance. Please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Floating Label Input - Email */}
            <div className="relative pt-5">
              <input 
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                className="peer w-full bg-transparent border-b-2 border-burgundy/10 px-0 py-2 text-burgundy font-body focus:border-burgundy focus:outline-none transition-colors placeholder-transparent"
                placeholder="Email Address"
                required
              />
              <label 
                htmlFor="email"
                className={`absolute left-0 font-ui transition duration-200 pointer-events-none
                  ${focused === 'email' || email ? 'top-0 text-xs text-burgundy uppercase font-bold tracking-wider' : 'top-7 text-sm text-burgundy/50'}`}
              >
                Email Address
              </label>
            </div>

            {/* Floating Label Input - Password */}
            <div className="relative pt-5">
              <input 
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                className="peer w-full bg-transparent border-b-2 border-burgundy/10 px-0 py-2 pr-10 text-burgundy font-body focus:border-burgundy focus:outline-none transition-colors placeholder-transparent"
                placeholder="Password"
                required
              />
              <label 
                htmlFor="password"
                className={`absolute left-0 font-ui transition duration-200 pointer-events-none
                  ${focused === 'password' || password ? 'top-0 text-xs text-burgundy uppercase font-bold tracking-wider' : 'top-7 text-sm text-burgundy/50'}`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-7 text-burgundy/30 hover:text-burgundy/60 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`relative flex items-center justify-center w-5 h-5 rounded shrink-0 border transition-all duration-200 ${remember ? 'bg-burgundy border-burgundy text-white' : 'border-burgundy/30 bg-transparent group-hover:border-burgundy'}`}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {remember && <Check size={14} strokeWidth={3} className="animate-in zoom-in duration-200" />}
                </div>
                <span className="font-body text-sm text-burgundy/60 group-hover:text-burgundy transition-colors">Remember me</span>
              </label>
              <button type="button" onClick={handleForgotPassword} className="font-ui text-xs font-bold uppercase tracking-wider text-rose-gold hover:text-wine transition-colors">
                Forgot Password?
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-burgundy text-ivory font-ui text-xs font-bold uppercase tracking-wider hover:bg-wine transition-colors disabled:opacity-60 mt-8 shadow-xl shadow-burgundy/20"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin relative z-10" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} className="relative z-10" />
                </>
              )}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-10 font-body text-sm text-burgundy/50">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-semibold text-burgundy hover:text-wine transition-colors border-b border-burgundy/30 pb-0.5 hover:border-wine">
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
