'use client';

import { useState } from 'react';
import { m as motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { loginAction } from '@/app/actions/auth';
import { useAdminAuthStore } from '@/lib/store/admin-auth-store';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('expectedRole', 'admin');
      
      const result = await loginAction(formData);
      
      if (result.error) {
        setError(result.error.includes('Failed to authenticate') ? 'Invalid email or password.' : result.error);
        return;
      }
      
      // Sync client state
      useAdminAuthStore.setState({ user: result.user as any, isAuthenticated: true });
      
      router.push('/yara-admin');
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
          <div className="flex flex-col items-center">
            <Image 
              src="/images/yara-logo.png" 
              alt="Yara" 
              width={300} 
              height={120} 
              className="h-20 sm:h-24 w-auto hover:scale-105 transition-transform duration-500 mb-2" 
              priority
            />
            <div className="flex items-center gap-2 text-burgundy font-ui uppercase tracking-widest font-bold text-sm bg-burgundy/5 px-4 py-1.5 rounded-full border border-burgundy/10">
              <ShieldCheck size={16} />
              Admin Portal
            </div>
          </div>
        </motion.div>

        {/* Glass Card Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/50 p-8 sm:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.04)] mt-8"
        >
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl font-bold text-burgundy mb-2">Secure Login</h1>
            <p className="font-body text-burgundy/50">
              Authorized personnel only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-red-50 text-red-600 text-sm font-body px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                {error}
              </motion.div>
            )}
            <div className="relative pt-5">
              <input 
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                className="peer w-full bg-transparent border-b-2 border-burgundy/10 px-0 py-2 text-burgundy font-body focus:border-burgundy focus:outline-none transition-colors placeholder-transparent"
                placeholder="Admin Email"
                required
              />
              <label 
                htmlFor="email"
                className={`absolute left-0 font-ui transition duration-200 pointer-events-none
                  ${focused === 'email' || email ? 'top-0 text-xs text-burgundy uppercase font-bold tracking-wider' : 'top-7 text-sm text-burgundy/50'}`}
              >
                Admin Email
              </label>
            </div>

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
                  <span>Login</span>
                  <ArrowRight size={16} className="relative z-10" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
