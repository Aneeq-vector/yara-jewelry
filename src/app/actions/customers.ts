'use server';

import { getAdminClient } from '@/lib/pocketbase-server';
import { revalidatePath } from 'next/cache';

export async function getCustomersAction() {
  try {
    const pb = await getAdminClient();
    
    // Fetch all users with role 'customer'
    const records = await pb.collection('users').getFullList({
      filter: 'role = "customer"',
      sort: '-created'
    });
    
    // Fetch all orders to aggregate spent and orders count
    const orders = await pb.collection('orders').getFullList({
      expand: 'user'
    });
    
    // Fetch all addresses
    const addresses = await pb.collection('addresses').getFullList();
    
    const customers = records.map((record) => {
      // Find orders for this customer
      const customerOrders = orders.filter((o: any) => o.user === record.id);
      
      const orderCount = customerOrders.length;
      const spentAmount = customerOrders.reduce((total: number, order: any) => total + (Number(order.totalAmount) || 0), 0);
      
      const joinedDate = new Date(record.created).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      return {
        id: record.id,
        name: record.name || 'Unknown',
        email: record.email,
        phone: record.phone || '',
        orders: orderCount,
        spent: `Rs. ${spentAmount.toLocaleString()}`,
        joined: joinedDate,
        status: record.status || 'Active', // Default to Active if not set
        addresses: addresses.filter((a: any) => a.user === record.id).map((a: any) => ({
          id: a.id,
          name: a.name,
          street: a.street,
          city: a.city,
          state: a.state,
          zipCode: a.zip,
          phone: a.phone,
          isDefault: a.isDefault
        }))
      };
    });
    
    return { success: true, customers: JSON.parse(JSON.stringify(customers)) };
  } catch (error: any) {
    console.error('Failed to fetch customers:', error);
    return { success: false, error: error.message || 'Failed to fetch customers' };
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    const pb = await getAdminClient();
    await pb.collection('users').delete(id);
    
    revalidatePath('/admin/customers');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete customer:', error);
    return { success: false, error: error.message || 'Failed to delete customer' };
  }
}

export async function deleteCustomersAction(ids: string[]) {
  try {
    const pb = await getAdminClient();
    
    // Delete all selected customers concurrently
    await Promise.all(
      ids.map(id => pb.collection('users').delete(id))
    );

    revalidatePath('/admin/customers');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete customers:', error);
    return { success: false, error: error.message || 'Failed to delete customers' };
  }
}

export async function updateCustomerStatusAction(id: string, status: string) {
  try {
    const pb = await getAdminClient();
    // Update the customer record with the new status
    // Note: This requires a 'status' field to exist in the 'users' collection in PocketBase.
    await pb.collection('users').update(id, { status });
    
    revalidatePath('/admin/customers');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update customer status:', error);
    return { success: false, error: error.message || 'Failed to update customer status' };
  }
}
