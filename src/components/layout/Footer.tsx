'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';

const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);
import { BRAND, FOOTER_LINKS } from '@/lib/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showToast, setShowToast] = useState(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === '#') {
      e.preventDefault();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <footer className="bg-burgundy text-ivory/90 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-wine/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-rose-gold/10 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top CTA */}
        <div className="py-10 sm:py-16 border-b border-ivory/10">
          <div className="flex flex-col gap-6 text-center">
            <div>
              <h3 className="font-heading text-xl sm:text-3xl lg:text-4xl font-semibold text-ivory mb-2">
                Join the Yara Community
              </h3>
              <p className="font-body text-sm text-ivory/60 max-w-sm mx-auto">
                Subscribe for exclusive drops, early access &amp; styling inspiration.
              </p>
            </div>
            <div className="flex w-full max-w-md mx-auto border border-ivory/20 rounded-full overflow-hidden focus-within:border-rose-gold/50 transition-colors bg-ivory/10">
              <input aria-label="Your email address"
                type="email"
                placeholder="Your email address"
                className="flex-1 min-w-0 bg-transparent px-4 sm:px-6 py-3.5 text-sm font-body text-ivory placeholder:text-ivory/40 focus:outline-none"
              />
              <button className="bg-gradient-to-r from-rose-gold to-rose-gold-light text-burgundy px-4 sm:px-8 py-3.5 font-ui font-semibold text-xs sm:text-sm uppercase tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="py-12 sm:py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0 -mt-6 lg:-mt-8">
            <Image
              src="/images/yara-logo.png"
              alt="Yara"
              width={500}
              height={200}
              className="h-32 sm:h-40 w-auto brightness-0 invert opacity-90 -mb-8 sm:-mb-10 -mt-2 sm:-mt-4"
            />
            <p className="font-body text-sm text-ivory/50 leading-relaxed max-w-xs">
              Premium imitation jewelry designed to elevate every moment. Crafted for elegance, made for you.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="w-10 h-10 rounded-full bg-ivory/10 flex items-center justify-center hover:bg-ivory/20 transition-colors shrink-0"
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href={BRAND.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="w-10 h-10 rounded-full bg-ivory/10 flex items-center justify-center hover:bg-ivory/20 transition-colors shrink-0"
              >
                <FacebookIcon size={16} />
              </a>
              <a
                href={BRAND.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on TikTok"
                className="w-10 h-10 rounded-full bg-ivory/10 flex items-center justify-center hover:bg-ivory/20 transition-colors shrink-0"
              >
                <svg width="15" height="15" viewBox="0 0 448 512" fill="currentColor">
                  <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h4 className="font-ui font-bold text-xs uppercase tracking-[0.15em] text-ivory/40 mb-5">Shop</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="font-body text-sm text-ivory/60 hover:text-ivory transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-ui font-bold text-xs uppercase tracking-[0.15em] text-ivory/40 mb-5">Company</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="font-body text-sm text-ivory/60 hover:text-ivory transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-ui font-bold text-xs uppercase tracking-[0.15em] text-ivory/40 mb-5">Support</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="font-body text-sm text-ivory/60 hover:text-ivory transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-ui font-bold text-xs uppercase tracking-[0.15em] text-ivory/40 mb-5">Legal</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="font-body text-sm text-ivory/60 hover:text-ivory transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex py-5 border-t border-ivory/10 items-center justify-center">
          <p className="font-body text-xs text-ivory/40 text-center">
            © {currentYear} Yara Jewelry. All rights reserved.
          </p>
        </div>
      </div>
      


      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl bg-ivory text-burgundy shadow-2xl border border-rose-gold/20"
          >
            <span className="font-body text-sm font-medium">We are currently working on this page. Check back soon!</span>
            <button aria-label="Action" onClick={() => setShowToast(false)} className="text-burgundy/60 hover:text-burgundy transition-colors ml-2">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
