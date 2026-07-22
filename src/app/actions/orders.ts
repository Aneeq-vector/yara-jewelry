'use server';

import { getServerClient, getAdminClient } from '@/lib/pocketbase-server';
import { revalidatePath } from 'next/cache';

export async function createOrderAction(formData: FormData) {
  try {
    const pb = await getServerClient();
    // Set the user to the currently authenticated user if available
    if (pb.authStore.isValid && pb.authStore.record) {
      formData.set('user', pb.authStore.record.id);
    }

    // Initial status
    formData.set('status', 'pending');
    
    // Set paymentStatus based on paymentMethod
    const paymentMethod = formData.get('paymentMethod');
    if (paymentMethod === 'cod') {
      formData.set('paymentStatus', 'pending');
    } else {
      // bank_transfer
      formData.set('paymentStatus', 'pending');
    }

    // Create the order in PocketBase
    const record = await pb.collection('orders').create(formData);
    
    // Revalidate dashboard orders page so it shows the new order
    revalidatePath('/dashboard/orders');

    return { success: true, orderId: record.orderId || record.id };
  } catch (error: any) {
    console.error('Failed to create order:', error);
    return { success: false, error: error.message || 'Failed to create order' };
  }
}

export async function getAllOrdersAction() {
  try {
    const pb = await getAdminClient();
    const records = await pb.collection('orders').getFullList({
      sort: '-orderDate',
      expand: 'user,items'
    });
    return { success: true, orders: JSON.parse(JSON.stringify(records)) };
  } catch (error: any) {
    console.error('Failed to fetch orders:', error);
    return { success: false, error: error.message || 'Failed to fetch orders' };
  }
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    const pb = await getAdminClient();
    
    // Use pb.send to bypass any SDK update() specific issues while keeping SDK auth
    await pb.send(`/api/collections/orders/records/${orderId}`, {
      method: 'PATCH',
      body: { status }
    });

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update order status:', error?.message || error);
    return { success: false, error: error?.message || String(error) || 'Failed to update order status' };
  }
}

export async function updateOrderPaymentStatusAction(orderId: string, paymentStatus: string) {
  try {
    const pb = await getAdminClient();
    
    // Use pb.send to bypass any SDK update() specific issues while keeping SDK auth
    await pb.send(`/api/collections/orders/records/${orderId}`, {
      method: 'PATCH',
      body: { paymentStatus }
    });

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update order payment status:', error?.message || error);
    return { success: false, error: error?.message || String(error) || 'Failed to update order payment status' };
  }
}

export async function deleteOrdersAction(orderIds: string[]) {
  try {
    const pb = await getAdminClient();
    
    // Delete all selected orders
    await Promise.all(
      orderIds.map(id => pb.collection('orders').delete(id))
    );

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete orders:', error?.message || error);
    return { success: false, error: error?.message || String(error) || 'Failed to delete orders' };
  }
}
