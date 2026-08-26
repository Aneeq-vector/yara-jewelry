import { getServerSession } from '@/lib/pocketbase-server';
import { RecordModel } from 'pocketbase';

export interface CustomerOrdersResult {
  success: boolean;
  orders?: RecordModel[];
  totalItems?: number;
  totalPages?: number;
  page?: number;
  error?: string;
}

export async function getCustomerOrdersData(): Promise<CustomerOrdersResult> {
  try {
    const { pb, user } = await getServerSession();
    if (!user || !user.id) {
      throw new Error("Unauthorized");
    }

    const result = await pb.collection('orders').getList(1, 50, {
      filter: `user="${user.id}"`,
      expand: 'items',
      sort: '-orderDate',
      $autoCancel: false,
    });

    const items = result.items;

    return {
      success: true,
      orders: structuredClone(items),
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      page: result.page,
    };
  } catch (error: any) {
    console.error('Failed to fetch customer orders data:', error);
    return { success: false, error: error?.message || 'Failed to fetch customer orders data' };
  }
}
