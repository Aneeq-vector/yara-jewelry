'use client';

import { useState } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2, Check, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { loginAction, requestPasswordResetAction } from '@/app/actions/auth';
import { useAuthStore } from '@/lib/store/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<{message: string, notFound?: boolean} | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError({ message: "Please enter your email address." });
      return;
    }
    
    setForgotError(null);
    setForgotLoading(true);
    const result = await requestPasswordResetAction(forgotEmail);
    setForgotLoading(false);
    
    if (result.success) {
      setForgotSuccess(true);
    } else {
      setForgotError({ message: result.error || 'An error occurred', notFound: false });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('expectedRole', 'customer');
      formData.append('remember', remember ? 'true' : 'false');
      
      const result = await loginAction(formData);
      
      if (result.error) {
        setError(result.error.includes('Failed to authenticate') ? 'Invalid email or password.' : result.error);
        setLoading(false);
        return;
      }
      
      // Sync client auth state immediately
      useAuthStore.setState({ user: result.user as any, isAuthenticated: true });
      
      // Stop the loading spinner immediately
      setLoading(false);
      
      // Navigate in the next tick so React renders the non-loading state first
      setTimeout(() => {
        router.push('/dashboard');
      }, 0);

      // Fire wishlist sync in background after navigation starts
      import('@/app/actions/wishlist').then(({ syncWishlistAction }) => {
        import('@/lib/store/wishlist-store').then(({ useWishlistStore }) => {
          const localItems = useWishlistStore.getState().items.map(i => i.id);
          syncWishlistAction(localItems).then(syncRes => {
            if (syncRes.success && syncRes.items) {
              useWishlistStore.getState().setWishlist(syncRes.items);
            }
          }).catch(() => {});
        });
      });
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred. Please try again.');
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
          className="flex justify-center -mb-4 -mt-10 relative z-20 overflow-hidden w-full px-4"
        >
          <Link href="/">
            <Image 
              src="/images/yara-logo.png" 
              alt="Yara" 
              width={400} 
              height={160} 
              className="h-28 sm:h-36 w-auto max-w-[280px] sm:max-w-[340px] hover:scale-105 transition-transform duration-500" 
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
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                className="bg-red-50/80 backdrop-blur-md text-red-700 text-sm font-ui px-5 py-4 rounded-2xl border border-red-200 shadow-sm flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" strokeWidth={2} />
                <span className="leading-relaxed font-medium">{error}</span>
              </motion.div>
            )}
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
              <button type="button" onClick={() => setIsForgotModalOpen(true)} className="font-ui text-xs font-bold tracking-wider text-rose-gold hover:text-wine transition-colors">
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
          <div className="mt-8 text-center relative z-10">
            <p className="font-body text-burgundy/60 text-sm">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="font-ui font-bold text-burgundy hover:text-wine tracking-wider transition-colors">
                Create Account
              </Link>
            </p>
          </div>

          {/* Forgot Password Modal */}
          <AnimatePresence>
            {isForgotModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsForgotModalOpen(false)}
                  className="absolute inset-0 bg-ivory/80 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-burgundy/10"
                >
                  <button 
                    onClick={() => setIsForgotModalOpen(false)}
                    className="absolute top-6 right-6 text-burgundy/40 hover:text-burgundy transition-colors"
                  >
                    <X size={20} />
                  </button>
                  
                  <h2 className="font-heading text-2xl font-bold text-burgundy mb-2">Reset Password</h2>
                  
                  {forgotSuccess ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                      </div>
                      <h3 className="font-heading text-xl font-bold text-burgundy mb-2">Check Your Email</h3>
                      <p className="font-body text-burgundy/70 mb-6">
                        If an account exists with <strong>{forgotEmail}</strong>, we've sent a password reset link. Please check your inbox.
                      </p>
                      <button
                        onClick={() => {
                          setIsForgotModalOpen(false);
                          setForgotSuccess(false);
                          setForgotEmail('');
                        }}
                        className="w-full py-4 rounded-full bg-burgundy text-ivory font-ui text-xs font-bold uppercase tracking-wider hover:bg-wine transition-colors"
                      >
                        Back to Login
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="font-body text-burgundy/60 mb-6">
                        Enter your email address and we'll send you a secure link to reset your password.
                      </p>
                      
                      <form onSubmit={handleForgotPassword} className="space-y-6">
                        {forgotError && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="bg-red-50 text-red-600 text-sm font-body p-4 rounded-xl border border-red-100 flex flex-col gap-3"
                          >
                            <div className="flex items-start gap-2">
                              <AlertCircle size={18} className="shrink-0 mt-0.5" />
                              <span>{forgotError.message}</span>
                            </div>
                            {forgotError.notFound && (
                              <Link href="/auth/signup" className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg font-ui text-xs font-bold uppercase tracking-wider text-center transition-colors">
                                Create an Account
                              </Link>
                            )}
                          </motion.div>
                        )}
                        
                        <div className="relative">
                          <input 
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-burgundy/10 px-0 py-2 text-burgundy font-body focus:border-burgundy focus:outline-none transition-colors"
                            placeholder="Email Address"
                            required
                          />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={forgotLoading}
                          className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-burgundy text-ivory font-ui text-xs font-bold uppercase tracking-wider hover:bg-wine transition-colors disabled:opacity-60"
                        >
                          {forgotLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <span>Send Reset Link</span>
                          )}
                        </button>
                      </form>
                    </>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
