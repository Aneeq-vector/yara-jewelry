import { getAdminClient } from '@/lib/pocketbase-server';
import { Customer } from '@/lib/store/customers-store';
import CustomersClient from './_CustomersClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CustomersPage() {
  let initialCustomers: Customer[] = [];
  let totalItems = 0;
  let totalPages = 0;
  try {
    const { getCustomersAction } = await import('@/app/actions/customers');
    const res = await getCustomersAction(1, 10);
    if (res.success && res.customers) {
      initialCustomers = res.customers;
      totalItems = res.totalItems || 0;
      totalPages = res.totalPages || 0;
    }
  } catch (err) {
    console.error('Failed to prefetch customers:', err);
  }
  return <CustomersClient initialCustomers={initialCustomers} initialTotalItems={totalItems} initialTotalPages={totalPages} />;
}
