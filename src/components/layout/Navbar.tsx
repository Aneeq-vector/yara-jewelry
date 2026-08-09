'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils';
import { MobileMenu } from './MobileMenu';

interface NavbarProps {
  onSearchOpen: () => void;
}

export default function Navbar({ onSearchOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { isAuthenticated, user } = useAuthStore();

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

  // Sync auth and wishlist with Pocketbase — only once per browser session
  useEffect(() => {
    // Skip if already synced this session (fast path for subsequent navigations)
    const alreadySynced = sessionStorage.getItem('yara_synced');
    if (alreadySynced) return;

    const syncWithServer = async () => {
      try {
        const { getUserAction } = await import('@/app/actions/auth');
        const serverUser = await getUserAction();
        
        if (serverUser && serverUser.id) {
          useAuthStore.setState({ user: serverUser as any, isAuthenticated: true });
          // Mark as synced so subsequent page navigations skip this
          sessionStorage.setItem('yara_synced', '1');

          // Sync wishlist in background — don't block anything
          import('@/app/actions/wishlist').then(({ syncWishlistAction }) => {
            const localItems = useWishlistStore.getState().items.map(i => i.id);
            syncWishlistAction(localItems).then(res => {
              if (res.success && res.items) {
                useWishlistStore.getState().setWishlist(res.items);
              }
            }).catch(() => {});
          });
        } else if (serverUser === null) {
          useAuthStore.setState({ user: null, isAuthenticated: false });
          sessionStorage.removeItem('yara_synced');
        }
      } catch (err) {}
    };
    
    syncWithServer();
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-colors duration-500 transform-gpu',
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
                <m.div
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
                </m.div>
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
                    <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gradient-to-r from-rose-gold to-burgundy group-hover:w-full transition-[width] duration-400" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Icons */}
            <div className="flex items-center justify-end gap-1 sm:gap-3 text-burgundy">
              <m.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSearchOpen}
                className="p-2.5 rounded-full hover:bg-champagne/60 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Search"
              >
                <Search size={19} strokeWidth={1.8} />
              </m.button>

              <Link href="/wishlist" className="relative outline-none focus:outline-none">
                <m.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-full hover:bg-champagne/60 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Heart size={19} strokeWidth={1.8} />
                  {isMounted && wishlistCount > 0 && (
                    <m.span
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full gradient-rose-gold text-[10px] font-bold text-white flex items-center justify-center"
                    >
                      {wishlistCount}
                    </m.span>
                  )}
                </m.div>
              </Link>

              <Link href="/cart" className="relative outline-none focus:outline-none">
                <m.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-full hover:bg-champagne/60 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <ShoppingBag size={19} strokeWidth={1.8} />
                  {isMounted && cartCount > 0 && (
                    <m.span
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full gradient-burgundy text-[10px] font-bold text-white flex items-center justify-center"
                    >
                      {cartCount}
                    </m.span>
                  )}
                </m.div>
              </Link>

              {isMounted && isAuthenticated && user ? (
                <Link href="/dashboard" className="hidden sm:flex items-center pl-1 outline-none focus:outline-none">
                  <m.div
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
                  </m.div>
                </Link>
              ) : (
                <Link href="/auth/login" className="hidden sm:block outline-none focus:outline-none">
                  <m.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-full hover:bg-champagne/60 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <User size={19} strokeWidth={1.8} />
                  </m.div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <MobileMenu 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
        isAuthenticated={isAuthenticated} 
        user={user} 
      />
    </>
  );
}
