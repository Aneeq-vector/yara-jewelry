'use client';

import { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2, Sparkles, Mail, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';

import { sendOtpAction, verifyOtpAndRegisterAction } from '@/app/actions/auth';

type Step = 'form' | 'otp' | 'success';

export default function SignupPage() {
  const router = useRouter();

  // --- Form state ---
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  // --- Flow state ---
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // --- OTP state ---
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const updateForm = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (step !== 'otp') return;
    setTimeLeft(600);
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // --- Step 1: Send OTP ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (form.password !== form.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('phone', form.phone);
      fd.append('password', form.password);
      fd.append('passwordConfirm', form.confirmPassword);
      const result = await sendOtpAction(fd);
      if (result.error) { setErrorMsg(result.error); return; }
      setStep('otp');
      // Focus first OTP box
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } finally {
      setLoading(false);
    }
  };

  // --- OTP input handlers ---
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split('').forEach((char, i) => { if (i < 6) next[i] = char; });
    setOtp(next);
    const lastFilledIdx = Math.min(pasted.length, 5);
    otpRefs.current[lastFilledIdx]?.focus();
  };

  // --- Step 2: Verify OTP ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const code = otp.join('');
    if (code.length < 6) { setErrorMsg('Please enter the complete 6-digit code.'); return; }
    setLoading(true);
    try {
      const result = await verifyOtpAndRegisterAction(form.email, code);
      if (result.error) { setErrorMsg(result.error); return; }

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

      setStep('success');
      setTimeout(() => router.push('/dashboard'), 2000);
    } finally {
      setLoading(false);
    }
  };

  // --- Resend OTP ---
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);
    setErrorMsg('');
    setOtp(['', '', '', '', '', '']);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('phone', form.phone);
      fd.append('password', form.password);
      fd.append('passwordConfirm', form.confirmPassword);
      const result = await sendOtpAction(fd);
      if (result.error) { setErrorMsg(result.error); return; }
      setTimeLeft(600);
      setResendCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-champagne/60 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-gold/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[540px] mt-6 sm:mt-8 pb-12">
        {/* Logo */}
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

        {/* Glass Card */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/50 p-8 sm:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.04)]"
        >
          <AnimatePresence mode="wait">

            {/* ──────────────────── STEP 1: SIGNUP FORM ──────────────────── */}
            {step === 'form' && (
              <m.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <div className="text-center mb-10">
                  <h1 className="font-heading text-3xl font-bold text-burgundy mb-2">Create Account</h1>
                  <p className="font-body text-burgundy/50">Join us and discover premium elegance.</p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-6">
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

                  {errorMsg && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-body mt-4 border border-red-100">
                      {errorMsg}
                    </div>
                  )}

                  <m.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || (form.password !== form.confirmPassword && form.confirmPassword !== '')}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-burgundy text-ivory font-ui text-xs font-bold uppercase tracking-wider hover:bg-wine transition-colors disabled:opacity-60 mt-8 shadow-xl shadow-burgundy/20"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight size={16} />
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
            )}

            {/* ──────────────────── STEP 2: OTP VERIFICATION ──────────────────── */}
            {step === 'otp' && (
              <m.div key="otp" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-burgundy/10 flex items-center justify-center">
                    <Mail size={28} className="text-burgundy" />
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h2 className="font-heading text-2xl font-bold text-burgundy mb-2">Check Your Email</h2>
                  <p className="font-body text-sm text-burgundy/50 leading-relaxed">
                    We sent a 6-digit verification code to
                  </p>
                  <p className="font-body text-sm font-semibold text-burgundy mt-1">{form.email}</p>
                </div>

                <form onSubmit={handleVerifyOtp}>
                  {/* 6 OTP Input Boxes */}
                  <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-12 h-14 text-center text-xl font-bold text-burgundy bg-white border-2 rounded-xl outline-none transition-all duration-200
                          ${digit ? 'border-burgundy shadow-sm shadow-burgundy/20' : 'border-burgundy/15'}
                          focus:border-burgundy focus:shadow-sm focus:shadow-burgundy/20`}
                        aria-label={`OTP digit ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Timer */}
                  <div className="text-center mb-4">
                    {timeLeft > 0 ? (
                      <p className="font-body text-xs text-burgundy/40">
                        Code expires in <span className="font-semibold text-burgundy">{formatTime(timeLeft)}</span>
                      </p>
                    ) : (
                      <p className="font-body text-xs text-red-500">Your code has expired. Please request a new one.</p>
                    )}
                  </div>

                  {errorMsg && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-body mb-4 border border-red-100 text-center">
                      {errorMsg}
                    </div>
                  )}

                  <m.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || otp.join('').length < 6 || timeLeft === 0}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-burgundy text-ivory font-ui text-xs font-bold uppercase tracking-wider hover:bg-wine transition-colors disabled:opacity-50 shadow-xl shadow-burgundy/20"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Verify & Create Account</span><ArrowRight size={16} /></>}
                  </m.button>
                </form>

                {/* Resend + Change email */}
                <div className="flex flex-col items-center gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || resendLoading}
                    className="flex items-center gap-1.5 font-body text-sm text-burgundy/50 hover:text-burgundy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep('form'); setErrorMsg(''); setOtp(['', '', '', '', '', '']); }}
                    className="font-body text-xs text-burgundy/30 hover:text-burgundy/60 transition-colors"
                  >
                    ← Change email address
                  </button>
                </div>
              </m.div>
            )}

            {/* ──────────────────── STEP 3: SUCCESS ──────────────────── */}
            {step === 'success' && (
              <m.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
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
