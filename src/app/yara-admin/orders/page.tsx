import { validateSession } from '@/lib/pocketbase-server';
import OrdersClient from './_OrdersClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrdersPage() {
  let initialOrders: any[] = [];
  let initialTotal = 0;
  let initialPages = 1;
  try {
    const { pb } = await validateSession();
    const res = await pb.collection('orders').getList(1, 50, {
      sort: '-orderDate',
      expand: 'user',
      $autoCancel: false,
    });
    initialOrders = JSON.parse(JSON.stringify(res.items));
    initialTotal = res.totalItems;
    initialPages = res.totalPages;
  } catch (err) {
    console.error('Failed to prefetch orders:', err);
  }
  return (
    <OrdersClient
      initialOrders={initialOrders}
      initialTotal={initialTotal}
      initialPages={initialPages}
    />
  );
}
