'use client';

import { m as motion } from 'framer-motion';
import { Package, Heart, MapPin } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { useWishlistStore } from '@/lib/store/wishlist-store';

export default function DashboardClientStats({ orderCount, wishlistCount: serverWishlistCount, addressesCount }: { orderCount: number, wishlistCount: number, addressesCount: number }) {
  const localWishlistCount = useWishlistStore((s) => s.items.length);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const displayWishlistCount = mounted ? localWishlistCount : serverWishlistCount;

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6">
      {[
        { label: 'Total Orders', value: orderCount, icon: Package },
        { label: 'Wishlist Items', value: displayWishlistCount, icon: Heart },
        { label: 'Addresses', value: addressesCount, icon: MapPin },
      ].map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-3 sm:p-5 flex flex-col gap-2 sm:gap-4 relative overflow-hidden group"
          >
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-gold/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="font-ui text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-burgundy/60 leading-tight">{stat.label}</div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-champagne/60 flex items-center justify-center shrink-0">
                <Icon size={12} className="text-rose-gold sm:hidden" />
                <Icon size={16} className="text-rose-gold hidden sm:block" />
              </div>
            </div>
            <div className="font-heading text-2xl sm:text-3xl font-bold text-burgundy relative z-10">{stat.value}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
