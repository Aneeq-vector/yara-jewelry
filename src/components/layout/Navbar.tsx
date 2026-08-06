'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
} from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onSearchOpen: () => void;
}

export default function Navbar({ onSearchOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Sync auth and wishlist with Pocketbase
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const { getUserAction } = await import('@/app/actions/auth');
        const serverUser = await getUserAction();
        
        if (serverUser && serverUser.id) {
          useAuthStore.setState({ user: serverUser as any, isAuthenticated: true });
          
          // Sync wishlist
          try {
            const { syncWishlistAction } = await import('@/app/actions/wishlist');
            const localItems = useWishlistStore.getState().items.map(i => i.id);
            const res = await syncWishlistAction(localItems);
            if (res.success && res.items) {
              useWishlistStore.getState().setWishlist(res.items);
            }
          } catch (e) {
            console.error('Failed to sync wishlist on load', e);
          }
        } else if (serverUser === null) {
          useAuthStore.setState({ user: null, isAuthenticated: false });
        }
      } catch (err) {}
    };
    
    syncWithServer();
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500 transform-gpu',
          scrolled
            ? 'bg-ivory shadow-lg shadow-burgundy/5 py-3'
            : 'bg-ivory py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between relative">
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-burgundy hover:text-wine transition-colors"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group h-10 sm:h-12 relative z-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="pointer-events-none"
                >
                  <Image
                    src="/images/yara-logo.png"
                    alt="Yara"
                    width={320}
                    height={128}
                    className="h-24 sm:h-28 w-auto object-contain pointer-events-none -my-6 sm:-my-8"
                    priority
                  />
                </motion.div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block absolute left-1/2 -translate-x-1/2">
              <nav className="flex items-center gap-8">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative font-ui text-[13px] font-semibold uppercase tracking-[0.1em] text-burgundy/80 hover:text-burgundy transition-colors duration-300 group outline-none focus:outline-none"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gradient-to-r from-rose-gold to-burgundy group-hover:w-full transition-all duration-400" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Icons */}
            <div className="flex items-center justify-end gap-1 sm:gap-3 text-burgundy">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSearchOpen}
                className="p-2.5 rounded-full hover:bg-champagne/60 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Search"
              >
                <Search size={19} strokeWidth={1.8} />
              </motion.button>

              <Link href="/wishlist" className="hidden sm:block relative outline-none focus:outline-none">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-full hover:bg-champagne/60 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Heart size={19} strokeWidth={1.8} />
                  {isMounted && wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full gradient-rose-gold text-[10px] font-bold text-white flex items-center justify-center"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              <Link href="/cart" className="relative outline-none focus:outline-none">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-full hover:bg-champagne/60 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <ShoppingBag size={19} strokeWidth={1.8} />
                  {isMounted && cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full gradient-burgundy text-[10px] font-bold text-white flex items-center justify-center"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              {isMounted && isAuthenticated && user ? (
                <Link href="/dashboard" className="hidden sm:flex items-center pl-1 outline-none focus:outline-none">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-champagne/40 transition-colors"
                  >
                    <div className="shrink-0 w-7 h-7 rounded-full gradient-rose-gold flex items-center justify-center text-[11px] font-heading font-bold text-white shadow-sm">
                      {user.name?.charAt(0)}
                    </div>
                    <span className="font-ui text-xs font-semibold text-burgundy truncate max-w-[100px]">
                      {user.name?.split(' ')[0]}
                    </span>
                  </motion.div>
                </Link>
              ) : (
                <Link href="/auth/login" className="hidden sm:block outline-none focus:outline-none">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-full hover:bg-champagne/60 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <User size={19} strokeWidth={1.8} />
                  </motion.div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-burgundy/40 backdrop-blur-sm z-[60]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[300px] bg-ivory z-[70] shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-10">
                  <Image
                    src="/images/yara-logo.png"
                    alt="Yara"
                    width={240}
                    height={96}
                    className="h-16 w-auto"
                  />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-full hover:bg-champagne transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="space-y-1">
                  {NAV_LINKS.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-3 px-4 rounded-xl font-ui text-sm font-semibold uppercase tracking-wider text-burgundy/80 hover:text-burgundy hover:bg-champagne/50 transition-all"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <div className="mt-10 pt-8 border-t border-nude/60">
                  {isAuthenticated && user ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl font-ui text-sm font-semibold text-burgundy hover:bg-champagne/50 transition-all"
                    >
                      <div className="shrink-0 w-7 h-7 rounded-full gradient-rose-gold flex items-center justify-center text-[11px] font-heading font-bold text-white shadow-sm">
                        {user.name?.charAt(0)}
                      </div>
                      {user.name}
                    </Link>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl font-ui text-sm font-semibold text-burgundy hover:bg-champagne/50 transition-all"
                    >
                      <User size={18} />
                      My Account
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
