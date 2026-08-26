import { fetchDashboardStatsAction, fetchDashboardRecentOrdersAction, fetchDashboardTopProductsAction } from './dashboardActions';
import DashboardClient from './_DashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  let initialStats = { totalRevenue: 0, totalOrdersCount: 0, activeCustomersCount: 0 };
  let initialRecentOrders: any[] = [];
  let initialTopProducts: any[] = [];

  try {
    const [stats, recentOrders, topProducts] = await Promise.all([
      fetchDashboardStatsAction(),
      fetchDashboardRecentOrdersAction(),
      fetchDashboardTopProductsAction(),
    ]);

    initialStats = stats;
    initialRecentOrders = recentOrders;
    initialTopProducts = topProducts;
  } catch (err) {
    console.error('Failed to load dashboard data', err);
  }

  return (
    <DashboardClient 
      initialStats={initialStats} 
      initialRecentOrders={initialRecentOrders} 
      initialTopProducts={initialTopProducts} 
    />
  );
}
