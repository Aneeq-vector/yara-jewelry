import { getAdminClient } from '@/lib/pocketbase-server';
import { Customer } from '@/lib/store/customers-store';
import CustomersClient from './_CustomersClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CustomersPage() {
  let initialCustomers: Customer[] = [];
  try {
    const pb = await getAdminClient();
    const [records, orders, addresses] = await Promise.all([
      pb.collection('users').getFullList({ filter: 'role = "customer"', sort: '-created' }),
      pb.collection('orders').getFullList({ fields: 'user,totalAmount' }),
      pb.collection('addresses').getFullList({ fields: 'id,user,name,street,city,state,zip,phone,isDefault' }),
    ]);
    initialCustomers = records.map((record: any) => {
      const customerOrders = orders.filter((o: any) => o.user === record.id);
      const orderCount = customerOrders.length;
      const spentAmount = customerOrders.reduce((t: number, o: any) => t + (Number(o.totalAmount) || 0), 0);
      const customerAddresses = addresses.filter((a: any) => a.user === record.id);
      return {
        id: record.id,
        name: record.name || '',
        email: record.email || '',
        phone: record.phone || '',
        status: record.status || 'Active',
        orders: orderCount,
        spent: spentAmount,
        joined: record.created,
        updatedAt: record.updated,
        avatar: record.avatar || '',
        addresses: customerAddresses,
      } as unknown as Customer;
    });
  } catch (err) {
    console.error('Failed to prefetch customers:', err);
  }
  return <CustomersClient initialCustomers={initialCustomers} />;
}
