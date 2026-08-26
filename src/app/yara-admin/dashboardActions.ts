'use server';

import { validateSession } from '@/lib/pocketbase-server';

export async function fetchDashboardStatsAction() {
  const { pb } = await validateSession();
  
  const [usersRes, revenueRes] = await Promise.all([
    pb.collection('users').getList(1, 1, { filter: 'role = "customer"', fields: 'id' }).catch((e) => { console.error('USERS_ERR:', e); return { totalItems: 0 }; }),
    pb.collection('orders').getList(1, 500, { fields: 'totalAmount' }).catch((e) => { console.error('REVENUE_ERR:', e); return { items: [], totalItems: 0 }; }),
  ]);

  const totalOrdersCount = revenueRes.totalItems || (revenueRes.items ? revenueRes.items.length : 0);
  const totalRevenue = (revenueRes.items || []).reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
  
  return {
    totalRevenue,
    totalOrdersCount,
    activeCustomersCount: usersRes.totalItems || 0,
  };
}

export async function fetchDashboardRecentOrdersAction() {
  const { pb } = await validateSession();
  // using -created just in case orderDate is not fully populated, but original was -orderDate.
  // Wait, I will use -orderDate as requested by original semantics
  const res = await pb.collection('orders').getList(1, 5, { sort: '-orderDate', expand: 'user' }).catch(() => ({ items: [] }));
  return res.items || [];
}

export async function fetchDashboardTopProductsAction() {
  const { pb } = await validateSession();
  const res = await pb.collection('products').getList(1, 4, { sort: '-reviewCount' }).catch(() => ({ items: [] }));
  return res.items || [];
}
