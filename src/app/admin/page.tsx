'use client';

import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';

const STATS = [
  { name: 'Total Revenue', value: 'Rs. 450,200', change: '+12.5%', isPositive: true, icon: DollarSign },
  { name: 'Total Orders', value: '1,240', change: '+8.2%', isPositive: true, icon: ShoppingBag },
  { name: 'Active Customers', value: '856', change: '+15.3%', isPositive: true, icon: Users },
  { name: 'Conversion Rate', value: '3.2%', change: '-0.4%', isPositive: false, icon: TrendingUp },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-burgundy">Dashboard Overview</h1>
          <p className="text-burgundy/60 font-body text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-white border border-burgundy/10 text-burgundy text-sm rounded-xl px-4 py-2 font-body outline-none focus:border-burgundy/30 transition-colors cursor-pointer">
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

      {/* Stats Grid */}
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
        {/* Recent Orders (Mock) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-burgundy/5 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-heading font-bold text-burgundy">Recent Orders</h2>
            <button className="text-sm font-ui text-burgundy/60 hover:text-burgundy">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-burgundy/10 text-burgundy/60 font-body text-sm">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm font-body">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-burgundy/5 last:border-0 hover:bg-ivory/50 transition-colors">
                    <td className="py-4 font-ui font-medium text-burgundy">#YR-{2450 + i}</td>
                    <td className="py-4 text-burgundy/80">Emma Thompson</td>
                    <td className="py-4 text-burgundy/80">Eternity Diamond Ring</td>
                    <td className="py-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        Processing
                      </span>
                    </td>
                    <td className="py-4 text-right font-ui font-medium text-burgundy">Rs. 45,000</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm p-6">
          <h2 className="text-lg font-heading font-bold text-burgundy mb-6">Top Products</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-ivory transition-colors cursor-pointer border border-transparent hover:border-burgundy/10">
                <div className="w-12 h-12 bg-champagne rounded-lg overflow-hidden flex-shrink-0">
                  {/* Placeholder for product image */}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-burgundy truncate">Classic Gold Chain</h3>
                  <p className="text-xs text-burgundy/60 font-ui mt-0.5">340 sales</p>
                </div>
                <div className="font-ui font-medium text-sm text-burgundy">
                  Rs. 15,000
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
