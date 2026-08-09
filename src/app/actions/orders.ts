'use server';

import { getServerSession, validateSession, getAdminClient } from '@/lib/pocketbase-server';
import { revalidatePath } from 'next/cache';

export async function createOrderAction(formData: FormData) {
  try {
    const { pb, user } = await getServerSession();
    // Set the user to the currently authenticated user if available
    if (user) {
      formData.set('user', user.id);
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
    
    // Send Invoice Email
    try {
      const email = formData.get('email') as string;
      if (email) {
        const { sendInvoiceEmail } = await import('@/lib/email');
        const fullAddress = [
          formData.get('shippingStreet'),
          formData.get('shippingCity'),
          formData.get('shippingZip'),
          formData.get('shippingCountry')
        ].filter(Boolean).join(', ');

        // Fire and forget the email, or await it. Awaiting is safer for serverless.
        await sendInvoiceEmail({
          orderId: record.orderId || record.id,
          orderDate: record.orderDate || new Date().toISOString(),
          customerName: formData.get('shippingName') as string || 'Customer',
          customerEmail: email,
          shippingAddress: fullAddress,
          paymentMethod: formData.get('paymentMethod') as string || 'Unknown',
          totalAmount: formData.get('totalAmount') as string || '0',
          cartDetails: formData.get('cartDetails') as string || '[]',
        });
      }
    } catch (emailError) {
      console.error('Failed to send invoice email:', emailError);
    }
    
    // Revalidate dashboard orders page so it shows the new order
    revalidatePath('/dashboard/orders');

    return { success: true, orderId: record.orderId || record.id };
  } catch (error: any) {
    console.error('Failed to create order:', error);
    return { success: false, error: error.message || 'Failed to create order' };
  }
}

export async function getAllOrdersAction(page: number = 1, perPage: number = 50) {
  try {
    const { pb } = await validateSession();
    const result = await pb.collection('orders').getList(page, perPage, {
      sort: '-orderDate',
      fields: 'id,orderId,orderDate,status,paymentStatus,totalAmount,shippingName,shippingEmail,shippingPhone,shippingCity,paymentMethod,cartDetails,user,expand',
      expand: 'user',
    });
    return {
      success: true,
      orders: structuredClone(result.items),
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      page: result.page,
    };
  } catch (error: any) {
    console.error('Failed to fetch orders:', error);
    return { success: false, error: error.message || 'Failed to fetch orders' };
  }
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    const { pb } = await validateSession();
    
    // Use pb.send to bypass any SDK update() specific issues while keeping SDK auth
    await pb.send(`/api/collections/orders/records/${orderId}`, {
      method: 'PATCH',
      body: { status }
    });

    revalidatePath('/yara-admin/orders');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update order status:', error?.message || error);
    return { success: false, error: error?.message || String(error) || 'Failed to update order status' };
  }
}

export async function updateOrderPaymentStatusAction(orderId: string, paymentStatus: string) {
  try {
    const { pb } = await validateSession();
    
    // Use pb.send to bypass any SDK update() specific issues while keeping SDK auth
    await pb.send(`/api/collections/orders/records/${orderId}`, {
      method: 'PATCH',
      body: { paymentStatus }
    });

    revalidatePath('/yara-admin/orders');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update order payment status:', error?.message || error);
    return { success: false, error: error?.message || String(error) || 'Failed to update order payment status' };
  }
}

export async function deleteOrdersAction(orderIds: string[]) {
  try {
    const { pb } = await validateSession();
    
    // Delete all selected orders
    await Promise.all(
      orderIds.map(id => pb.collection('orders').delete(id))
    );

    revalidatePath('/yara-admin/orders');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete orders:', error?.message || error);
    return { success: false, error: error?.message || String(error) || 'Failed to delete orders' };
  }
}
