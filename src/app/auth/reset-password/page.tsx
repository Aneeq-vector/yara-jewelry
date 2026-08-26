'use client';

import { useState, Suspense } from 'react';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { confirmPasswordResetAction } from '@/app/actions/auth';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('This password reset link is invalid or has expired. Please request a new one.');
      return;
    }

    if (password.length < 8) {
      setError('Passwords must be at least 8 characters long.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await confirmPasswordResetAction(token, password, passwordConfirm);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-6"
      >
        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="font-heading text-2xl font-bold text-burgundy mb-2">Password Reset Complete</h2>
        <p className="font-body text-burgundy/70 mb-8">
          Your password has been reset successfully.
        </p>
        <Link
          href="/auth/login"
          className="w-full inline-block py-4 rounded-full bg-burgundy text-ivory font-ui text-xs font-bold uppercase tracking-wider hover:bg-wine transition-colors"
        >
          Sign In
        </Link>
      </motion.div>
    );
  }

  return (
    <>
      <div className="text-center mb-10">
        <h1 className="font-heading text-3xl font-bold text-burgundy mb-2">Create New Password</h1>
        <p className="font-body text-burgundy/50">
          Please enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            className="bg-red-50/80 backdrop-blur-md text-red-700 text-sm font-ui px-5 py-4 rounded-2xl border border-red-200 shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" strokeWidth={2} />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
            {error.includes('invalid or has expired') && (
              <Link href="/auth/login" className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg font-ui text-xs font-bold uppercase tracking-wider text-center transition-colors">
                Back to Forgot Password
              </Link>
            )}
          </motion.div>
        )}

        {/* Floating Label Input - New Password */}
        <div className="relative pt-5">
          <input 
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
            className="peer w-full bg-transparent border-b-2 border-burgundy/10 px-0 py-2 pr-10 text-burgundy font-body focus:border-burgundy focus:outline-none transition-colors placeholder-transparent"
            placeholder="New Password"
            required
            minLength={8}
          />
          <label 
            htmlFor="password"
            className={`absolute left-0 font-ui transition duration-200 pointer-events-none
              ${focused === 'password' || password ? 'top-0 text-xs text-burgundy uppercase font-bold tracking-wider' : 'top-7 text-sm text-burgundy/50'}`}
          >
            New Password (min 8 characters)
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

        {/* Floating Label Input - Confirm Password */}
        <div className="relative pt-5">
          <input 
            type={showConfirmPassword ? 'text' : 'password'}
            id="passwordConfirm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            onFocus={() => setFocused('passwordConfirm')}
            onBlur={() => setFocused(null)}
            className="peer w-full bg-transparent border-b-2 border-burgundy/10 px-0 py-2 pr-10 text-burgundy font-body focus:border-burgundy focus:outline-none transition-colors placeholder-transparent"
            placeholder="Confirm Password"
            required
            minLength={8}
          />
          <label 
            htmlFor="passwordConfirm"
            className={`absolute left-0 font-ui transition duration-200 pointer-events-none
              ${focused === 'passwordConfirm' || passwordConfirm ? 'top-0 text-xs text-burgundy uppercase font-bold tracking-wider' : 'top-7 text-sm text-burgundy/50'}`}
          >
            Confirm Password
          </label>
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-0 top-7 text-burgundy/30 hover:text-burgundy/60 transition-colors"
            aria-label="Toggle password confirm visibility"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
              <span>Reset Password</span>
              <ArrowRight size={16} className="relative z-10" />
            </>
          )}
        </motion.button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="animate-spin text-burgundy" size={32} /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
