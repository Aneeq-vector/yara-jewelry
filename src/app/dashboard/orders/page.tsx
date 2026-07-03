'use client';

import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

const orders = [
  { id: 'YRA-A1B2C3', date: '2026-06-25', status: 'delivered' as const, total: 3498, items: 2, products: ['Aurora Pearl Drop Earrings', 'Serenity Layered Chain'] },
  { id: 'YRA-D4E5F6', date: '2026-06-20', status: 'shipped' as const, total: 1799, items: 1, products: ['Lumière Pendant Necklace'] },
  { id: 'YRA-G7H8I9', date: '2026-06-15', status: 'processing' as const, total: 5998, items: 3, products: ['Empress Collection Set', 'Celestial Crystal Studs', 'Petal Rose Gold Ring'] },
];

const statusColors = {
  processing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-burgundy mb-2">My Orders</h1>
        <p className="font-body text-burgundy/50">View and track your recent orders.</p>
      </motion.div>

      <div className="space-y-4">
        {orders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-3xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-ui font-bold text-sm text-burgundy">{order.id}</p>
                <p className="font-body text-xs text-burgundy/40">
                  {new Date(order.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-ui font-bold uppercase tracking-wider ${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              {order.products.map((name) => (
                <div key={name} className="flex items-center gap-3 p-2 rounded-xl bg-champagne/20">
                  <ShoppingBag size={14} className="text-burgundy/30" />
                  <span className="font-body text-sm text-burgundy/60">{name}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-nude/30">
              <span className="font-body text-sm text-burgundy/50">{order.items} items</span>
              <span className="font-ui font-bold text-burgundy">Rs. {order.total.toLocaleString()}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
