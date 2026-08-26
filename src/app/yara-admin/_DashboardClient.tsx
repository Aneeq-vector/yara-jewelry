'use client';

import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { queryKeys } from '@/lib/query-keys';
import { PB_URL } from '@/lib/pocketbase';
import { fetchDashboardStatsAction, fetchDashboardRecentOrdersAction, fetchDashboardTopProductsAction } from './dashboardActions';

export default function DashboardClient({ initialStats, initialRecentOrders, initialTopProducts }: any) {
  const { data: stats } = useQuery({
    queryKey: queryKeys.admin.dashboard.stats(),
    queryFn: fetchDashboardStatsAction,
    initialData: initialStats,
    staleTime: Infinity, // Rely on realtime invalidations
  });

  const { data: recentOrders } = useQuery({
    queryKey: queryKeys.admin.dashboard.recentOrders(),
    queryFn: fetchDashboardRecentOrdersAction,
    initialData: initialRecentOrders,
    staleTime: Infinity,
  });

  const { data: topProducts } = useQuery({
    queryKey: queryKeys.admin.dashboard.topProducts(),
    queryFn: fetchDashboardTopProductsAction,
    initialData: initialTopProducts,
    staleTime: Infinity,
  });

  const avgOrderValue = stats.totalOrdersCount > 0 ? stats.totalRevenue / stats.totalOrdersCount : 0;

  const STATS = [
    { name: 'Total Revenue', value: `Rs. ${stats.totalRevenue.toLocaleString()}`, change: '+12.5%', isPositive: true, icon: DollarSign },
    { name: 'Total Orders', value: stats.totalOrdersCount.toString(), change: '+5.2%', isPositive: true, icon: ShoppingBag },
    { name: 'Total Customers', value: stats.activeCustomersCount.toString(), change: '+2.1%', isPositive: true, icon: Users },
    { name: 'Avg Order Value', value: `Rs. ${Math.round(avgOrderValue).toLocaleString()}`, change: '+1.4%', isPositive: true, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-burgundy">Dashboard Overview</h1>
          <p className="text-burgundy/60 font-body text-sm mt-1">Live data from PocketBase.</p>
        </div>
        <div className="flex items-center gap-3">
          <select aria-label="Action" className="bg-white border border-burgundy/10 text-burgundy text-sm rounded-xl px-4 py-2 font-body outline-none focus:border-burgundy/30 transition-colors cursor-pointer">
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
          <button className="bg-burgundy text-white px-4 py-2 rounded-xl font-ui text-sm font-semibold hover:bg-wine transition-colors shadow-md shadow-burgundy/20">
            Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-burgundy/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-gold/20 flex items-center justify-center text-burgundy">
                <stat.icon size={20} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                stat.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-burgundy/60 font-body text-sm font-medium">{stat.name}</h3>
            <p className="text-2xl font-ui font-bold text-burgundy mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-burgundy/5 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-heading font-bold text-burgundy">Recent Orders</h2>
            <button className="text-sm font-ui text-burgundy/60 hover:text-burgundy">View All</button>
          </div>
          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-burgundy/60">No orders found.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-burgundy/10 text-burgundy/60 font-body text-sm">
                    <th className="pb-3 font-medium">Order ID</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-body">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-burgundy/5 last:border-0 hover:bg-ivory/50 transition-colors">
                      <td className="py-4 font-ui font-medium text-burgundy">#{order.orderId || order.id.slice(0, 8)}</td>
                      <td className="py-4 text-burgundy/80">{order.shippingName || order.expand?.user?.name || 'Guest'}</td>
                      <td className="py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 text-right font-ui font-medium text-burgundy">Rs. {(order.totalAmount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm p-6">
          <h2 className="text-lg font-heading font-bold text-burgundy mb-6">Top Products</h2>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-burgundy/60">No products found.</p>
            ) : (
              topProducts.map((product: any) => (
                <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-ivory transition-colors cursor-pointer border border-transparent hover:border-burgundy/10">
                  <div className="w-12 h-12 bg-champagne rounded-lg overflow-hidden flex-shrink-0 relative">
                    {product.images && product.images[0] && (
                      <Image 
                        src={`${PB_URL}/api/files/${product.collectionId}/${product.id}/${product.images[0]}`} 
                        alt={product.name} 
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-burgundy truncate">{product.name}</h3>
                    <p className="text-xs font-ui mt-0.5">
                      <span className={product.quantity > 0 ? 'text-emerald-600' : 'text-red-500'}>
                        {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </p>
                  </div>
                  <div className="font-ui font-medium text-sm text-burgundy">
                    Rs. {product.price?.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
