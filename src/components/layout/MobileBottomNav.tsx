'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  onSearchOpen: () => void;
}

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Search, label: 'Search', href: '#search' },
  { icon: ShoppingBag, label: 'Cart', href: '/cart' },
  { icon: Heart, label: 'Wishlist', href: '/wishlist' },
  { icon: User, label: 'Account', href: '/auth/login' },
];

export default function MobileBottomNav({ onSearchOpen }: MobileBottomNavProps) {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const getBadge = (label: string) => {
    if (label === 'Cart' && cartCount > 0) return cartCount;
    if (label === 'Wishlist' && wishlistCount > 0) return wishlistCount;
    return null;
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
    >
      <div className="mx-3 mb-3">
        <div className="glass-strong rounded-2xl px-2 py-2 shadow-lg shadow-burgundy/10">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const badge = getBadge(item.label);

              if (item.href === '#search') {
                return (
                  <button
                    key={item.label}
                    onClick={onSearchOpen}
                    className="flex flex-col items-center gap-0.5 py-1.5 px-3 relative"
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.8}
                      className="text-burgundy/60"
                    />
                    <span className="text-[10px] font-ui font-medium text-burgundy/50">
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center gap-0.5 py-1.5 px-3 relative"
                >
                  <div className="relative">
                    <Icon
                      size={20}
                      strokeWidth={1.8}
                      className={cn(
                        'transition-colors',
                        active ? 'text-burgundy' : 'text-burgundy/60'
                      )}
                    />
                    {badge && (
                      <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full gradient-rose-gold text-[9px] font-bold text-white flex items-center justify-center">
                        {badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-ui font-medium transition-colors',
                      active ? 'text-burgundy' : 'text-burgundy/50'
                    )}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="mobile-nav-active"
                      className="absolute -top-0.5 w-6 h-0.5 rounded-full gradient-rose-gold"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
