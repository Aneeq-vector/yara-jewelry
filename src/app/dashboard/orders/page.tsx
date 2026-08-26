import { getServerClient } from '@/lib/pocketbase-server';
import { redirect } from 'next/navigation';
import CustomerOrdersClient from './_CustomerOrdersClient';
import { getCustomerOrdersData } from '@/lib/data/customer-orders';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const pb = await getServerClient();
  
  if (!pb.authStore.isValid || !pb.authStore.record) {
    redirect('/auth/login');
  }

  const userId = pb.authStore.record.id;
  const authToken = pb.authStore.token;
  let orders: any[] = [];

  try {
    const res = await getCustomerOrdersData();
    if (res.success && res.orders) {
      orders = res.orders;
    }
  } catch (err) {
    console.error("Failed to fetch initial orders:", err);
  }

  return (
    <CustomerOrdersClient 
      userId={userId}
      authToken={authToken}
      initialOrders={orders}
    />
  );
}
