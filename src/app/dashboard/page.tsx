'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Package, Heart, MapPin, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';

const mockOrders = [
  { id: 'YRA-A1B2C3', date: '2026-06-25', status: 'delivered' as const, total: 3498, items: 2 },
  { id: 'YRA-D4E5F6', date: '2026-06-20', status: 'shipped' as const, total: 1799, items: 1 },
  { id: 'YRA-G7H8I9', date: '2026-06-15', status: 'processing' as const, total: 5998, items: 3 },
];

const statusColors = {
  processing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function DashboardOverviewPage() {
  const { user } = useAuthStore();
  const wishlistCount = useWishlistStore((s) => s.items.length);

  return (
    <>


      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Orders', value: mockOrders.length, icon: Package },
          { label: 'Wishlist Items', value: wishlistCount, icon: Heart },
          { label: 'Addresses', value: 2, icon: MapPin },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden group"
            >
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-gold/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="font-ui text-xs font-semibold uppercase tracking-wider text-burgundy/60">{stat.label}</div>
                <div className="w-8 h-8 rounded-full bg-champagne/60 flex items-center justify-center">
                  <Icon size={16} className="text-rose-gold" />
                </div>
              </div>
              <div className="font-heading text-3xl font-bold text-burgundy relative z-10">{stat.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold text-burgundy">Recent Orders</h2>
          <Link href="/dashboard/orders" className="font-ui text-xs font-semibold text-rose-gold hover:text-wine transition-colors">
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {mockOrders.map((order) => (
            <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-champagne/20 border border-nude/20 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-champagne/50 flex items-center justify-center shrink-0">
                  <ShoppingBag size={16} className="text-burgundy/50" />
                </div>
                <div>
                  <p className="font-ui font-semibold text-sm text-burgundy">{order.id}</p>
                  <p className="font-body text-xs text-burgundy/40">{order.items} items • {new Date(order.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-ui font-bold uppercase tracking-wider ${statusColors[order.status]}`}>
                  {order.status}
                </span>
                <p className="font-ui font-bold text-sm text-burgundy mt-1 sm:mt-2">Rs. {order.total.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
