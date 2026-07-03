'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Check, MessageCircle } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { BRAND } from '@/lib/constants';

// SVG for Tiktok
const TiktokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

// SVG for Instagram
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

// SVG for Facebook
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const socialLinks = [
    { name: 'Instagram', icon: InstagramIcon, href: BRAND.instagram, color: 'hover:text-pink-600' },
    { name: 'Facebook', icon: FacebookIcon, href: BRAND.facebook, color: 'hover:text-blue-600' },
    { name: 'TikTok', icon: TiktokIcon, href: 'https://tiktok.com/@yarajewelry', color: 'hover:text-black' },
  ];

  return (
    <PageWrapper>
      <div className="pt-24 min-h-screen">
        {/* Dynamic Hero */}
        <section className="py-20 relative overflow-hidden bg-ivory">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-rose-gold/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-champagne/40 rounded-full blur-[100px]" />
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="font-heading text-5xl sm:text-7xl font-bold text-burgundy mb-6 tracking-tight">
                Let&apos;s <span className="italic font-light">Connect</span>
              </h1>
              <p className="font-body text-lg text-burgundy/60 leading-relaxed">
                Whether you have a question about our pieces, need assistance with an order, or just want to say hello — we&apos;re here for you.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="pb-32 bg-ivory relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/50 p-6 sm:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.04)]">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
                
                {/* Left: Contact Info & Socials */}
                <div className="space-y-12">
                  <div>
                    <h2 className="font-heading text-3xl font-bold text-burgundy mb-8">Reach Out Directly</h2>
                    <div className="space-y-8">
                      {[
                        { icon: Mail, label: 'Email Us', value: BRAND.email, href: `mailto:${BRAND.email}` },
                        { icon: Phone, label: 'Call Us', value: BRAND.phone, href: `tel:${BRAND.phone}` },
                        { icon: MapPin, label: 'Visit Us', value: 'Colombo, Sri Lanka', href: '#' },
                      ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <motion.a
                            key={item.label}
                            href={item.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="flex items-start gap-5 group"
                          >
                            <div className="w-14 h-14 rounded-2xl bg-burgundy/5 flex items-center justify-center flex-shrink-0 group-hover:bg-burgundy group-hover:scale-105 transition-all duration-300">
                              <Icon size={24} className="text-burgundy group-hover:text-ivory transition-colors duration-300" />
                            </div>
                            <div>
                              <p className="font-ui font-bold uppercase tracking-wider text-xs text-burgundy/40 mb-1">{item.label}</p>
                              <p className="font-body text-lg text-burgundy font-medium group-hover:text-rose-gold transition-colors">{item.value}</p>
                            </div>
                          </motion.a>
                        );
                      })}
                    </div>
                  </div>

                  {/* WhatsApp Callout */}
                  <motion.a
                    href={`https://wa.me/${BRAND.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-between p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <MessageCircle size={22} className="text-emerald-600" />
                      </div>
                      <div>
                        <span className="block font-ui font-bold text-emerald-800 mb-0.5">Chat on WhatsApp</span>
                        <p className="font-body text-xs text-emerald-600/70">Quick replies, usually within an hour</p>
                      </div>
                    </div>
                  </motion.a>

                  {/* Social Media Links */}
                  <div>
                    <h3 className="font-ui font-bold uppercase tracking-wider text-xs text-burgundy/40 mb-6">Follow Our Journey</h3>
                    <div className="flex items-center gap-4">
                      {socialLinks.map((social, index) => {
                        const Icon = social.icon;
                        return (
                          <motion.a
                            key={social.name}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className={`w-12 h-12 rounded-full border border-burgundy/10 flex items-center justify-center text-burgundy hover:border-transparent hover:bg-white hover:shadow-lg transition-all duration-300 ${social.color}`}
                          >
                            <Icon className="w-5 h-5" />
                          </motion.a>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: Modern Form */}
                <div>
                  <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_40px_rgb(75,15,18,0.04)] border border-burgundy/5 relative overflow-hidden h-full">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-gold/10 to-transparent rounded-bl-full" />
                    
                    <h2 className="font-heading text-3xl font-bold text-burgundy mb-8 relative z-10">Send a Message</h2>

                    <AnimatePresence mode="wait">
                      {!submitted ? (
                        <motion.form 
                          key="form"
                          onSubmit={handleSubmit} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6 relative z-10"
                        >
                          {/* Floating Label Input - Name */}
                          <div className="relative mt-4 pt-5">
                            <input 
                              type="text"
                              id="name"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              onFocus={() => setFocused('name')}
                              onBlur={() => setFocused(null)}
                              className="peer w-full bg-transparent border-b-2 border-burgundy/10 px-0 py-2 text-burgundy font-body focus:border-burgundy focus:outline-none transition-colors placeholder-transparent"
                              placeholder="Your Name"
                              required
                            />
                            <label 
                              htmlFor="name"
                              className={`absolute left-0 font-ui transition-all duration-200 pointer-events-none
                                ${focused === 'name' || form.name ? 'top-0 text-xs text-burgundy uppercase font-bold tracking-wider' : 'top-7 text-sm text-burgundy/50'}`}
                            >
                              Your Name
                            </label>
                          </div>
                          
                          {/* Floating Label Input - Email */}
                          <div className="relative mt-4 pt-5">
                            <input 
                              type="email"
                              id="email"
                              value={form.email}
                              onChange={(e) => setForm({ ...form, email: e.target.value })}
                              onFocus={() => setFocused('email')}
                              onBlur={() => setFocused(null)}
                              className="peer w-full bg-transparent border-b-2 border-burgundy/10 px-0 py-2 text-burgundy font-body focus:border-burgundy focus:outline-none transition-colors placeholder-transparent"
                              placeholder="Your Email"
                              required
                            />
                            <label 
                              htmlFor="email"
                              className={`absolute left-0 font-ui transition-all duration-200 pointer-events-none
                                ${focused === 'email' || form.email ? 'top-0 text-xs text-burgundy uppercase font-bold tracking-wider' : 'top-7 text-sm text-burgundy/50'}`}
                            >
                              Email Address
                            </label>
                          </div>

                          {/* Floating Label Input - Subject */}
                          <div className="relative mt-4 pt-5">
                            <input 
                              type="text"
                              id="subject"
                              value={form.subject}
                              onChange={(e) => setForm({ ...form, subject: e.target.value })}
                              onFocus={() => setFocused('subject')}
                              onBlur={() => setFocused(null)}
                              className="peer w-full bg-transparent border-b-2 border-burgundy/10 px-0 py-2 text-burgundy font-body focus:border-burgundy focus:outline-none transition-colors placeholder-transparent"
                              placeholder="Subject"
                              required
                            />
                            <label 
                               htmlFor="subject"
                               className={`absolute left-0 font-ui transition-all duration-200 pointer-events-none
                                 ${focused === 'subject' || form.subject ? 'top-0 text-xs text-burgundy uppercase font-bold tracking-wider' : 'top-7 text-sm text-burgundy/50'}`}
                            >
                              Subject
                            </label>
                          </div>

                          {/* Floating Label Textarea - Message */}
                          <div className="relative mt-4 pt-5">
                            <textarea 
                              id="message"
                              value={form.message}
                              onChange={(e) => setForm({ ...form, message: e.target.value })}
                              onFocus={() => setFocused('message')}
                              onBlur={() => setFocused(null)}
                              rows={4}
                              className="peer w-full bg-transparent border-b-2 border-burgundy/10 px-0 py-2 text-burgundy font-body focus:border-burgundy focus:outline-none transition-colors placeholder-transparent resize-none"
                              placeholder="Message"
                              required
                            />
                            <label 
                               htmlFor="message"
                               className={`absolute left-0 font-ui transition-all duration-200 pointer-events-none
                                 ${focused === 'message' || form.message ? 'top-0 text-xs text-burgundy uppercase font-bold tracking-wider' : 'top-7 text-sm text-burgundy/50'}`}
                            >
                              Your Message
                            </label>
                          </div>

                          <motion.button 
                            whileHover={{ scale: 1.02 }} 
                            whileTap={{ scale: 0.98 }} 
                            type="submit" 
                            className="w-full mt-8 bg-burgundy text-ivory py-4 rounded-xl font-ui font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:bg-wine transition-colors shadow-lg shadow-burgundy/20"
                          >
                            <span>Send Message</span>
                            <Send size={16} />
                          </motion.button>
                        </motion.form>
                      ) : (
                        <motion.div 
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }} 
                          animate={{ opacity: 1, scale: 1 }} 
                          className="text-center py-20 flex flex-col items-center justify-center h-full"
                        >
                          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                            <Check size={32} className="text-emerald-600" />
                          </div>
                          <h3 className="font-heading text-3xl font-bold text-burgundy mb-3">Thank You</h3>
                          <p className="font-body text-burgundy/60">Your message has been sent. We'll be in touch shortly.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
