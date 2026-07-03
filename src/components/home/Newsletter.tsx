'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, ArrowRight, Check, Gem, Crown, Sparkles, Star } from 'lucide-react';

const floatingIcons = [
  { Icon: Gem,      top: '12%',  left: '8%',   right: undefined, bottom: undefined, size: 18, delay: 0 },
  { Icon: Crown,    top: '20%',  right: '10%', left: undefined,  bottom: undefined, size: 16, delay: 0.4 },
  { Icon: Star,     bottom: '25%', left: '12%', top: undefined,  right: undefined,  size: 14, delay: 0.8 },
  { Icon: Sparkles, bottom: '18%', right: '8%', top: undefined,  left: undefined,   size: 18, delay: 1.2 },
  { Icon: Gem,      top: '55%',  left: '4%',   right: undefined, bottom: undefined, size: 12, delay: 0.6 },
  { Icon: Star,     top: '40%',  right: '5%',  left: undefined,  bottom: undefined, size: 13, delay: 1.0 },
];

const perks = [
  'Exclusive early access to new drops',
  'Members-only styling tips & lookbooks',
  'Up to 20% off your first order',
];

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-150, 150], [6, -6]);
  const rotateY = useTransform(x, [-150, 150], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden bg-[#faf7f4]">
      {/* Ambient blobs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-rose-gold/10 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-burgundy/8 blur-[120px] pointer-events-none" />

      {/* Floating decorative icons */}
      {floatingIcons.map(({ Icon, top, left, right, bottom, size, delay }, i) => (
        <motion.div
          key={i}
          className="absolute text-rose-gold/25 pointer-events-none"
          style={{ top, left, right, bottom } as React.CSSProperties}
          animate={{ y: [0, -14, 0], rotate: [0, 12, 0] }}
          transition={{ duration: 4 + i * 0.5, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={size} />
        </motion.div>
      ))}

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' as const }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[2.5rem] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2"
        >
          {/* LEFT PANEL */}
          <div className="relative bg-burgundy p-10 lg:p-14 flex flex-col justify-between min-h-[380px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full border-[40px] border-rose-gold/20 pointer-events-none" />
            <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full border-[30px] border-white/5 pointer-events-none" />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-white/80 text-[10px] font-ui uppercase tracking-widest font-bold backdrop-blur-sm">
                <Sparkles size={10} className="text-rose-gold" />
                Inner Circle
              </span>
            </div>

            <div className="relative z-10 mt-8">
              <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-4">
                Wear the <br />
                <span className="text-rose-gold italic">World&apos;s</span><br />
                Finest.
              </h2>
              <p className="font-body text-white/55 text-sm leading-relaxed max-w-xs">
                Join thousands of jewelry lovers who get first access to limited collections and exclusive member rewards.
              </p>
            </div>

            <ul className="relative z-10 mt-8 space-y-3">
              {perks.map((perk, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                  className="flex items-center gap-3 text-white/75 font-body text-sm"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-gold/30 border border-rose-gold/60 flex items-center justify-center">
                    <Check size={10} className="text-rose-gold" />
                  </span>
                  {perk}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* RIGHT PANEL */}
          <div className="relative bg-[#faf7f4] p-10 lg:p-14 flex flex-col justify-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #6b0f2b 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-8">
                    <h3 className="font-heading text-3xl font-bold text-burgundy mb-2">
                      Your Invite Awaits
                    </h3>
                    <p className="font-body text-burgundy/45 text-sm">
                      Drop your email to unlock your membership instantly.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Floating label input */}
                    <div className="relative">
                      <motion.label
                        animate={{
                          y: focused || email ? -22 : 0,
                          scale: focused || email ? 0.8 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-4 top-3.5 font-body text-sm origin-left pointer-events-none text-white/50"
                        style={{ transformOrigin: 'left center' }}
                      >
                        Email address
                      </motion.label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        required
                        className="w-full pt-5 pb-2 px-4 bg-[#4a1c27] border-2 border-transparent rounded-2xl font-body text-sm text-white focus:outline-none focus:border-rose-gold/40 transition-all duration-200"
                      />
                      <motion.div
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-rose-gold rounded-full origin-left"
                        animate={{ scaleX: focused ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    {/* Submit button */}
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full relative overflow-hidden flex items-center justify-center gap-2 py-4 rounded-2xl bg-burgundy text-white font-ui font-bold text-sm uppercase tracking-widest"
                    >
                      <motion.span
                        className="absolute inset-0 bg-white/10 -skew-x-12 -translate-x-full"
                        whileHover={{ translateX: '200%' }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                      />
                      <Mail size={15} />
                      <span>Join the Inner Circle</span>
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <ArrowRight size={14} />
                      </motion.span>
                    </motion.button>
                  </form>

                  <p className="font-body text-[11px] text-burgundy/30 mt-5 text-center">
                    🔒 Zero spam. Unsubscribe anytime. Your privacy is sacred.
                  </p>

                  {/* Social proof */}
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {['#c9856a', '#b06b81', '#8b5c7e', '#6b3f6b'].map((bg, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full border-2 border-[#faf7f4]"
                          style={{ background: bg }}
                        />
                      ))}
                    </div>
                    <p className="font-body text-xs text-burgundy/50">
                      <span className="font-semibold text-burgundy">10,000+</span> members already inside
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  className="flex flex-col items-center justify-center text-center py-10 gap-5"
                >
                  <motion.div
                    className="w-20 h-20 rounded-full bg-burgundy flex items-center justify-center shadow-lg"
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <Check size={36} className="text-rose-gold" />
                  </motion.div>
                  <div>
                    <h3 className="font-heading text-3xl font-bold text-burgundy mb-2">
                      Welcome, Darling! ✨
                    </h3>
                    <p className="font-body text-burgundy/50 text-sm max-w-xs">
                      You&apos;re officially part of the Yara Inner Circle. Expect magic in your inbox soon.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
