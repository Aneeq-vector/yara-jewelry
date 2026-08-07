import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { getServerClient } from '@/lib/pocketbase-server';
import DashboardClientStats from './ClientStats';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const statusColors: Record<string, string> = {
  processing: 'bg-amber-100 text-amber-700',
  pending: 'bg-amber-100 text-amber-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default async function DashboardOverviewPage() {
  const pb = await getServerClient();
  
  if (!pb.authStore.isValid || !pb.authStore.record) {
    redirect('/auth/login');
  }

  const userId = pb.authStore.record.id;
  let orders: any[] = [];

  try {
    const res = await pb.collection('orders').getList(1, 5, {
      filter: `user="${userId}"`
    });
    orders = res.items;
  } catch (err) {}

  let wishlistCount = 0;
  try {
    const res = await pb.collection('wishlist').getList(1, 1, {
      filter: `user="${userId}"`
    });
    wishlistCount = res.totalItems;
  } catch (err) {}

  let addressesCount = 0;
  try {
    const res = await pb.collection('addresses').getList(1, 1, {
      filter: `user="${userId}"`
    });
    addressesCount = res.totalItems;
  } catch (err) {}

  return (
    <>
      {/* Quick Stats extracted to Client Component */}
      <DashboardClientStats orderCount={orders.length} wishlistCount={wishlistCount} addressesCount={addressesCount} />

      {/* Recent Orders */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold text-burgundy">Recent Orders</h2>
          <Link href="/dashboard/orders" className="font-ui text-xs font-semibold text-rose-gold hover:text-wine transition-colors">
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-sm text-burgundy/60 font-body">No orders found.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-champagne/20 border border-nude/20 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-champagne/50 flex items-center justify-center shrink-0">
                    <ShoppingBag size={16} className="text-burgundy/50" />
                  </div>
                  <div>
                    <p className="font-ui font-semibold text-sm text-burgundy">{order.orderId || `#${order.id.slice(0, 8)}`}</p>
                    <p suppressHydrationWarning className="font-body text-xs text-burgundy/40">
                      {new Date(order.orderDate ? order.orderDate.replace(' ', 'T') : (order.created ? order.created.replace(' ', 'T') : '2024-01-01T00:00:00Z')).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-ui font-bold uppercase tracking-wider ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                    {order.status || 'Pending'}
                  </span>
                  <p className="font-ui font-bold text-sm text-burgundy mt-1 sm:mt-2">Rs. {order.totalAmount?.toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
