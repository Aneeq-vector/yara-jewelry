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
        <div className="py-16 border-b border-ivory/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="font-heading text-3xl sm:text-4xl font-semibold text-ivory mb-2">
                Join the Yara Community
              </h3>
              <p className="font-body text-ivory/60 max-w-md">
                Subscribe for exclusive drops, early access & styling inspiration.
              </p>
            </div>
            <div className="flex w-full max-w-md">
              <input aria-label="Your email address"
                type="email"
                placeholder="Your email address"
                className="flex-1 min-w-0 bg-ivory/10 border border-ivory/20 rounded-l-full px-4 sm:px-6 py-3.5 text-sm font-body text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-rose-gold/50 transition-colors"
              />
              <button className="bg-gradient-to-r from-rose-gold to-rose-gold-light text-burgundy border border-transparent px-4 sm:px-6 py-3.5 rounded-r-full font-ui font-semibold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0 -mt-6 lg:-mt-8">
            <Image
              src="/images/yara-logo.png"
              alt="Yara"
              width={500}
              height={200}
              className="h-40 w-auto brightness-0 invert opacity-90 -mb-10 -mt-4"
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
                className="w-10 h-10 rounded-full bg-ivory/10 flex items-center justify-center hover:bg-ivory/20 transition-colors"
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href={BRAND.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="w-10 h-10 rounded-full bg-ivory/10 flex items-center justify-center hover:bg-ivory/20 transition-colors"
              >
                <FacebookIcon size={16} />
              </a>
              <a
                href={BRAND.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Pinterest"
                className="w-10 h-10 rounded-full bg-ivory/10 flex items-center justify-center hover:bg-ivory/20 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
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
        <div className="hidden sm:flex py-6 border-t border-ivory/10 flex-col sm:flex-row items-center justify-center gap-4">
          <p className="font-body text-xs text-ivory/40 text-center">
            © {currentYear} Yara Jewelry. All rights reserved.
          </p>
        </div>
      </div>
      


      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 50, scale: 0.95, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl bg-ivory text-burgundy shadow-2xl border border-rose-gold/20"
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
