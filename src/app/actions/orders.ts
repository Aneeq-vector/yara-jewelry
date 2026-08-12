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
    
    // Automatically reduce product quantity in stock
    try {
      const adminPb = await getAdminClient();
      const stockDeductionStr = formData.get('stockDeduction') as string;
      if (stockDeductionStr) {
        const stockItems = JSON.parse(stockDeductionStr) as { id: string, quantity: number }[];
        
        // Group by ID in case the same item appears multiple times (e.g. in a custom box)
        const deductions = stockItems.reduce((acc, item) => {
          acc[item.id] = (acc[item.id] || 0) + item.quantity;
          return acc;
        }, {} as Record<string, number>);

        for (const [prodId, qtyToDeduct] of Object.entries(deductions)) {
          if (prodId && qtyToDeduct > 0) {
            try {
              const productRecord = await adminPb.collection('products').getOne(prodId);
              const currentQty = Number(productRecord.quantity) || 0;
              const newQty = Math.max(0, currentQty - qtyToDeduct);
              await adminPb.collection('products').update(prodId, {
                quantity: newQty,
                inStock: newQty > 0
              });
            } catch (err) {
              console.error(`Failed to update quantity for product ${prodId}:`, err);
            }
          }
        }
      }
    } catch (stockError) {
      console.error('Failed to parse stock details for deduction:', stockError);
    }
    
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

export interface ManualOrderItem {
  productId: string;
  productName: string;
  price: number;
  // colorQuantities: { Yellow: 2, Green: 5 } — each color with its own count
  // If no colors, use key '' for the single quantity
  colorQuantities: Record<string, number>;
}

export interface ManualOrderPayload {
  shippingName: string;
  shippingPhone: string;
  shippingEmail?: string;
  shippingStreet?: string;
  shippingCity: string;
  shippingZip?: string;
  shippingCountry?: string;
  source: string;
  items: ManualOrderItem[];
  totalAmount: number;
  paymentMethod: 'cod' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid';
  notes?: string;
  deductStock: boolean;
}

export async function createManualOrderAction(payload: ManualOrderPayload) {
  try {
    const adminPb = await getAdminClient();
    const generatedOrderId = `YRA-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderDate = new Date().toISOString();

    // Build cartDetails array — one line per color-qty combination
    const cartDetails: string[] = [];
    if (payload.source) {
      cartDetails.push(`Source: ${payload.source}`);
    }
    for (const item of payload.items) {
      const entries = Object.entries(item.colorQuantities).filter(([, qty]) => qty > 0);
      if (entries.length === 0) continue;
      for (const [color, qty] of entries) {
        const colorStr = color ? ` [Color: ${color}]` : '';
        cartDetails.push(`${qty}x ${item.productName}${colorStr} - Rs. ${item.price}`);
      }
    }
    if (payload.notes) {
      cartDetails.push(`Notes: ${payload.notes}`);
    }

    const productIds = [...new Set(payload.items.map(i => i.productId).filter(Boolean))];

    const orderData = {
      orderId: generatedOrderId,
      orderDate,
      shippingName: payload.shippingName,
      shippingPhone: payload.shippingPhone,
      shippingEmail: payload.shippingEmail || '',
      shippingStreet: payload.shippingStreet || '',
      shippingCity: payload.shippingCity,
      shippingZip: payload.shippingZip || '00000',
      shippingCountry: payload.shippingCountry || 'Sri Lanka',
      totalAmount: payload.totalAmount,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentStatus,
      status: 'pending',
      items: productIds,
      cartDetails: JSON.stringify(cartDetails),
    };

    const record = await adminPb.collection('orders').create(orderData);

    // Deduct stock if requested — sum all color quantities per product
    if (payload.deductStock) {
      const deductions: Record<string, number> = {};
      for (const item of payload.items) {
        if (item.productId) {
          const totalQty = Object.values(item.colorQuantities).reduce((s, q) => s + q, 0);
          deductions[item.productId] = (deductions[item.productId] || 0) + totalQty;
        }
      }
      for (const [prodId, qty] of Object.entries(deductions)) {
        try {
          const productRecord = await adminPb.collection('products').getOne(prodId);
          const currentQty = Number(productRecord.quantity) || 0;
          const newQty = Math.max(0, currentQty - qty);
          await adminPb.collection('products').update(prodId, {
            quantity: newQty,
            inStock: newQty > 0,
          });
        } catch (err) {
          console.error(`Failed to deduct stock for product ${prodId}:`, err);
        }
      }
    }

    revalidatePath('/yara-admin/orders');
    return { success: true, orderId: record.orderId || record.id, record: structuredClone(record) };
  } catch (error: any) {
    console.error('Failed to create manual order:', error);
    return { success: false, error: error?.message || 'Failed to create manual order' };
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
    const adminPb = await getAdminClient();
    
    // Restore stock for all products in the deleted orders
    for (const orderId of orderIds) {
      try {
        const order = await adminPb.collection('orders').getOne(orderId, { expand: 'items' });
        const items = order.expand?.items || [];
        
        let cartDetails: string[] = [];
        try {
          if (Array.isArray(order.cartDetails)) {
            cartDetails = order.cartDetails;
          } else if (typeof order.cartDetails === 'string') {
            cartDetails = JSON.parse(order.cartDetails || '[]');
          }
        } catch(e) {}
        
        for (const product of items) {
          let quantityToRestore = 0;
          
          for (const detail of cartDetails) {
            if (typeof detail !== 'string') continue;
            if (detail.includes(product.name)) {
              const match = detail.match(/^(\d+)x/);
              if (match) {
                quantityToRestore += parseInt(match[1], 10);
              } else {
                quantityToRestore += 1;
              }
            }
          }
          
          if (quantityToRestore > 0) {
            const currentQty = Number(product.quantity) || 0;
            const newQty = currentQty + quantityToRestore;
            await adminPb.collection('products').update(product.id, {
              quantity: newQty,
              inStock: newQty > 0
            });
          }
        }
      } catch (err) {
        console.error(`Failed to restore stock for order ${orderId}:`, err);
      }
    }
    
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
