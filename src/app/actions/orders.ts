'use server';

import { getServerSession, validateSession, getAdminClient } from '@/lib/pocketbase-server';
import { revalidatePath } from 'next/cache';
import { validateColorStock, normalizeColorName } from '@/lib/colors';

const FALLBACK_BOX_ID = 'customize-gift-box-fallback';
const FALLBACK_BOX_PRICE = 400;

export async function createOrderAction(formData: FormData) {

  try {
    const { pb: customerPb, user: customerUser } = await getServerSession();
    
    if (customerUser && customerUser.role !== 'customer') {
      return { success: false, error: 'Please sign in with a customer account to place this order.' };
    }
    
    const adminPb = await getAdminClient();
    const idempotencyKey = formData.get('idempotencyKey') as string;
    if (!idempotencyKey) {
      throw new Error("Missing idempotency key");
    }

    // 1. Idempotency Check
    try {
      const existing = await adminPb.collection('orders').getFirstListItem(`idempotencyKey="${idempotencyKey}"`, { fields: 'id,orderId' });
      if (existing) {
        return { success: true, orderId: existing.orderId || existing.id, message: "Order already processed" };
      }
    } catch (e: any) {
      if (e.status !== 404) throw e;
    }

    const paymentMethod = formData.get('paymentMethod') as string || 'cod';
    const receiptFile = formData.get('receipt') as File | null;

    if (paymentMethod === 'bank_transfer') {
      if (!receiptFile || receiptFile.size === 0) {
        throw new Error("Payment receipt is required for bank transfer.");
      }
      if (receiptFile.size > 5 * 1024 * 1024) {
        throw new Error("Payment receipt must be smaller than 5 MB.");
      }
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(receiptFile.type)) {
        throw new Error("Invalid receipt format. Please upload JPG, PNG or PDF.");
      }
    }

    const rawItems = formData.get('cartItems') as string;
    if (!rawItems) throw new Error("Cart is empty");
    
    const cartItems = JSON.parse(rawItems);
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return { success: false, error: "Your cart is empty. Please add an item before placing an order." };
    }
    // 2. Collect unique Product IDs and Gift Box IDs to fetch authoritative data
    const productIdsToFetch = new Set<string>();
    const giftBoxIdsToFetch = new Set<string>();

    cartItems.forEach((item: any) => {
      if (item.giftBoxType === 'fixed' || item.isCustomBox || item.giftBoxType === 'custom') {
        const targetId = item.giftBoxId || item.product?.id;
        if (targetId && targetId !== FALLBACK_BOX_ID) {
          giftBoxIdsToFetch.add(targetId);
        }
        
        if ((item.isCustomBox || item.giftBoxType === 'custom') && Array.isArray(item.boxItems)) {
          item.boxItems.forEach((b: any) => {
            if (b.id) productIdsToFetch.add(b.id);
          });
        }
      } else {
        if (item.product?.id) {
          productIdsToFetch.add(item.product.id);
        }
      }
    });

    // 3. Fetch all referenced products and fixed gift boxes (Parallel)
    const productMap = new Map<string, any>();
    const giftBoxMap = new Map<string, any>();

    const productPromise = productIdsToFetch.size > 0 
      ? adminPb.collection('products').getFullList({ filter: Array.from(productIdsToFetch).map(id => `id="${id}"`).join(' || ') })
      : Promise.resolve([]);
      
    const boxPromise = giftBoxIdsToFetch.size > 0
      ? adminPb.collection('gift_boxes').getFullList({ filter: Array.from(giftBoxIdsToFetch).map(id => `id="${id}"`).join(' || '), expand: 'fixed_items' })
      : Promise.resolve([]);

    const [products, boxes] = await Promise.all([productPromise, boxPromise]);

    products.forEach(p => productMap.set(p.id, p));

    boxes.forEach(b => {
      giftBoxMap.set(b.id, b);
      if (b.expand?.fixed_items) {
        const fixedItems = Array.isArray(b.expand.fixed_items) ? b.expand.fixed_items : [b.expand.fixed_items];
        fixedItems.forEach((p: any) => productMap.set(p.id, p));
      }
    });

    let calculatedSubtotal = 0;
    const variantDeductions = new Map<string, { productId: string; color?: string; quantity: number }>();
    
    function addVariantDeduction(productId: string, quantity: number, color?: string) {
      const normalizedColor = color ? normalizeColorName(color) : undefined;
      const key = normalizedColor ? `${productId}::${normalizedColor}` : productId;
      const existing = variantDeductions.get(key);
      if (existing) {
        existing.quantity += quantity;
      } else {
        variantDeductions.set(key, { productId, color, quantity });
      }
    }
    const cartDetails: any[] = [];
    const finalProductIds = new Set<string>();

    // 4. Normalize Cart, Calculate Total, Aggregate Inventory
    for (const item of cartItems) {
      const qty = Number(item.quantity);
      if (qty <= 0 || !Number.isInteger(qty)) throw new Error(`Invalid quantity for item ${item.product?.name}`);

      if (item.giftBoxType === 'fixed') {
        const targetId = item.giftBoxId || item.product?.id;
        const dbBox = giftBoxMap.get(targetId);
        if (!dbBox || !dbBox.is_active || dbBox.type !== 'fixed') {
          return { success: false, error: "This gift box is no longer available. Please remove it from your cart and create it again.", removeStaleCartItemId: item.cartItemId };
        }

        let innerTotal = 0;
        const boxItemsArr = [];
        const fixedItems = dbBox.expand?.fixed_items ? (Array.isArray(dbBox.expand.fixed_items) ? dbBox.expand.fixed_items : [dbBox.expand.fixed_items]) : [];

        const submittedBoxItems = Array.isArray(item.boxItems) ? item.boxItems : [];
        for (const dbInner of fixedItems) {
          const p = Number(dbInner.price) || 0;
          innerTotal += p;
          finalProductIds.add(dbInner.id);
          
          const submittedInner = submittedBoxItems.find((b: any) => b.id === dbInner.id);
          const selectedColor = submittedInner?.selectedColor;
          addVariantDeduction(dbInner.id, qty, selectedColor);
          
          const extras = [selectedColor ? `Color: ${selectedColor}` : '', dbInner.material ? `Material: ${dbInner.material}` : '', dbInner.weight ? `Weight: ${dbInner.weight}` : ''].filter(Boolean).join(', ');
          boxItemsArr.push(`${dbInner.name}${extras ? ` [${extras}]` : ''}`);
        }

        const basePrice = Number(dbBox.box_price) || 0;
        const boxTotalPrice = basePrice + innerTotal;
        const lineTotal = boxTotalPrice * qty;
        calculatedSubtotal += lineTotal;

        cartDetails.push({
          productId: dbBox.id,
          productName: dbBox.name,
          quantity: qty,
          unitPrice: boxTotalPrice,
          lineTotal,
          boxItems: boxItemsArr,
          type: 'fixed_box'
        });
      } else if (item.isCustomBox || item.giftBoxType === 'custom') {
        let basePrice = 0;
        let boxName = 'Custom Box';
        const targetId = item.giftBoxId || item.product?.id;
        if (targetId === FALLBACK_BOX_ID) {
          basePrice = FALLBACK_BOX_PRICE;
        } else {
          const dbBox = giftBoxMap.get(targetId);
          if (!dbBox || !dbBox.is_active || dbBox.type !== 'custom') {
            return { success: false, error: "This gift box is no longer available. Please remove it from your cart and create it again.", removeStaleCartItemId: item.cartItemId };
          }
          basePrice = Number(dbBox.box_price) || 0;
          boxName = dbBox.name;
        }

        let innerTotal = 0;
        const boxItemsArr = [];
        if (Array.isArray(item.boxItems)) {
          for (const b of item.boxItems) {
            const dbInner = productMap.get(b.id);
            if (!dbInner) throw new Error(`Box item ${b.id} not found`);
            const p = Number(dbInner.price) || 0;
            innerTotal += p;

            finalProductIds.add(dbInner.id);
            addVariantDeduction(dbInner.id, qty, b.selectedColor);

            const extras = [b.selectedColor ? `Color: ${b.selectedColor}` : '', dbInner.material ? `Material: ${dbInner.material}` : '', dbInner.weight ? `Weight: ${dbInner.weight}` : ''].filter(Boolean).join(', ');
            boxItemsArr.push(`${dbInner.name}${extras ? ` [${extras}]` : ''}`);
          }
        }

        const boxTotalPrice = basePrice + innerTotal;
        const lineTotal = boxTotalPrice * qty;
        calculatedSubtotal += lineTotal;

        cartDetails.push({
          productId: item.product.id,
          productName: boxName,
          quantity: qty,
          unitPrice: boxTotalPrice,
          lineTotal,
          boxItems: boxItemsArr,
          type: 'custom_box'
        });
      } else {
        const dbProduct = productMap.get(item.product.id);
        if (!dbProduct) throw new Error(`Product ${item.product.id} not found`);
        const p = Number(dbProduct.price) || 0;
        const lineTotal = p * qty;
        calculatedSubtotal += lineTotal;

        finalProductIds.add(dbProduct.id);
        addVariantDeduction(dbProduct.id, qty, item.selectedColor);

        const extras = [item.selectedColor ? `Color: ${item.selectedColor}` : '', dbProduct.material ? `Material: ${dbProduct.material}` : '', dbProduct.weight ? `Weight: ${dbProduct.weight}` : ''].filter(Boolean).join(', ');
        const codeStr = dbProduct.productCode ? ` (${dbProduct.productCode})` : '';
        
        cartDetails.push({
          productId: dbProduct.id,
          productName: `${dbProduct.name}${codeStr}`,
          quantity: qty,
          unitPrice: p,
          lineTotal,
          extras,
          type: 'standard'
        });
      }
    }

    if (cartDetails.length === 0) {
      return { success: false, error: "Your cart is empty. Please add an item before placing an order." };
    }

    // Calculate shipping
    const deliveryMethod = formData.get('deliveryMethod') as string;
    let shippingFee = 450;
    if (calculatedSubtotal >= 10000 && deliveryMethod === 'standard') {
      shippingFee = 0;
    } else {
      if (deliveryMethod === 'express') shippingFee = 1000;
      else if (deliveryMethod === 'premium') shippingFee = 1450;
    }

    const calculatedTotalAmount = calculatedSubtotal + shippingFee;
    const generatedOrderId = formData.get('orderId') as string || `YRA-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderPayload = {
      idempotencyKey,
      orderId: generatedOrderId,
      orderDate: formData.get('orderDate') as string || new Date().toISOString(),
      shippingName: formData.get('shippingName') as string || '',
      shippingStreet: formData.get('shippingStreet') as string || '',
      shippingCity: formData.get('shippingCity') as string || '',
      shippingZip: formData.get('shippingZip') as string || '',
      shippingCountry: formData.get('shippingCountry') as string || 'Sri Lanka',
      shippingEmail: formData.get('email') as string || '',
      shippingPhone: formData.get('phone') as string || '',
      paymentMethod: formData.get('paymentMethod') as string || 'cod',
      totalAmount: calculatedTotalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      stock_restored: false,
      stock_snapshot: Array.from(variantDeductions.values()),
      cartDetails: JSON.stringify(cartDetails),
      items: Array.from(finalProductIds),
      user: (customerUser && customerUser.role === 'customer') ? customerUser.id : undefined,
    } as any;
    
    if (paymentMethod === 'bank_transfer' && receiptFile) {
      orderPayload.receipt = receiptFile;
    }
    
    // 5. Construct Transactional Batch
    const batch = adminPb.createBatch();

    // Create Order
    batch.collection('orders').create(orderPayload);

    // Deduct Stock
    // 1. Group deductions by productId
    const productDeductions = new Map<string, { color?: string; quantity: number, canonicalName?: string }[]>();
    for (const deduction of variantDeductions.values()) {
      const { productId, color, quantity } = deduction;
      const dbProduct = productMap.get(productId);
      if (!dbProduct) throw new Error(`Product ${productId} not found for deduction`);
      
      const v = validateColorStock(dbProduct, color || '', quantity);
      if (!v.valid) {
        throw new Error(v.error || `Stock error for ${dbProduct.name}`);
      }
      
      const arr = productDeductions.get(productId) || [];
      arr.push({ color, quantity, canonicalName: v.canonicalName });
      productDeductions.set(productId, arr);
      
      // Update the canonical name in the snapshot if needed
      if (v.canonicalName) {
        deduction.color = v.canonicalName;
      }
    }

    // 2. Compute one update per product
    for (const [prodId, deductionsArr] of productDeductions.entries()) {
      const dbProduct = productMap.get(prodId);
      
      if (dbProduct.inventoryMode === 'color') {
        const colorStock = { ...(dbProduct.colorStock || {}) };
        let totalDeductedGlobal = 0;
        
        for (const ded of deductionsArr) {
          const cName = ded.canonicalName || ded.color;
          if (cName && typeof colorStock[cName] === 'number') {
            colorStock[cName] -= ded.quantity;
            totalDeductedGlobal += ded.quantity;
          }
        }
        
        // Compute new global quantity
        const newTotalQty = Object.values(colorStock).reduce((sum: number, q: any) => sum + Number(q), 0);
        
        batch.collection('products').update(prodId, {
          colorStock: colorStock,
          quantity: newTotalQty
        });
        
      } else {
        // Global inventory mode
        const totalDeduct = deductionsArr.reduce((sum: number, d: any) => sum + d.quantity, 0);
        if (totalDeduct > 0) {
          batch.collection('products').update(prodId, {
            "quantity-": totalDeduct
          });
        }
      }
    }
    // Execute Batch
    await batch.send();

    // 6. Send Email (non-blocking using next/server after)
    try {
      const email = formData.get('email') as string;
      if (email) {
        const fullAddress = [
          formData.get('shippingStreet'),
          formData.get('shippingCity'),
          formData.get('shippingZip'),
          formData.get('shippingCountry')
        ].filter(Boolean).join(', ');

        const emailDetails = {
          orderId: generatedOrderId,
          orderDate: orderPayload.orderDate,
          customerName: orderPayload.shippingName || 'Customer',
          customerEmail: email,
          shippingAddress: fullAddress,
          paymentMethod: orderPayload.paymentMethod || 'Unknown',
          totalAmount: String(calculatedTotalAmount),
          cartDetails: JSON.stringify(cartDetails),
        };

        const { after } = await import('next/server');
        after(async () => {
          try {
            const { sendInvoiceEmail } = await import('@/lib/email');
            await sendInvoiceEmail(emailDetails);
          } catch (emailError) {
            console.error('Failed to send invoice email:', emailError);
          }
        });
      }
    } catch (err) {
      console.error('Failed to queue invoice email:', err);
    }

    return { success: true, orderId: generatedOrderId };

  } catch (error: any) {
    console.error('Failed to create order via Batch:', error);
    if (error.response?.data) console.error("Batch validation errors:", JSON.stringify(error.response.data, null, 2));
    return { success: false, error: error.message || 'Failed to create order' };
  }
}

export interface ManualOrderItem {
  productId: string;
  productName: string;
  price: number;
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
  receiptFile?: File | null;
  idempotencyKey?: string;
}

export async function createManualOrderAction(payload: ManualOrderPayload) {
  try {
    const adminPb = await getAdminClient();
    
    // 1. Validate Admin Session
    const { user } = await validateSession();
    if (!user) {
      throw new Error("Unauthorized: Admin session required.");
    }
    
    const idempotencyKey = payload.idempotencyKey || `manual_${Date.now()}_${Math.random()}`;

    // Idempotency check
    try {
      const existing = await adminPb.collection('orders').getFirstListItem(`idempotencyKey="${idempotencyKey}"`);
      if (existing) {
        return { success: true, orderId: existing.orderId || existing.id, record: structuredClone(existing) };
      }
    } catch (e: any) {
      if (e.status !== 404) throw e;
    }

    const generatedOrderId = `YRA-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderDate = new Date().toISOString();

    const productIdsToFetch = [...new Set(payload.items.map(i => i.productId).filter(Boolean))];
    const productMap = new Map<string, any>();
    if (productIdsToFetch.length > 0) {
      const idFilter = productIdsToFetch.map(id => `id="${id}"`).join(' || ');
      const products = await adminPb.collection('products').getFullList({ filter: idFilter });
      products.forEach(p => productMap.set(p.id, p));
    }

    let calculatedTotal = 0;
    const stockDeductions: Record<string, number> = {};
    const variantDeductions = new Map<string, { productId: string; color?: string; quantity: number }>();
    const cartDetails: any[] = [];
    
    if (payload.source) {
      cartDetails.push({ type: 'metadata', text: `Source: ${payload.source}` });
    }

    for (const item of payload.items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) throw new Error(`Product ${item.productId} not found`);

      const regularPrice = Number(dbProduct.price) || 0;
      
      let providedPrice = Number(item.price);
      if (isNaN(providedPrice) || !isFinite(providedPrice) || providedPrice < 0) {
        throw new Error(`Invalid price for product ${item.productId}`);
      }

      const entries = Object.entries(item.colorQuantities).filter(([, qty]) => qty > 0);
      if (entries.length === 0) continue;

      for (const [color, qty] of entries) {
        if (!Number.isInteger(qty) || qty <= 0) throw new Error("Invalid quantity");

        const lineTotal = providedPrice * qty;
        calculatedTotal += lineTotal;
        
        if (payload.deductStock) {
          const normalizedColor = color && color !== 'undefined' ? normalizeColorName(color) : undefined;
          const key = normalizedColor ? `${item.productId}::${normalizedColor}` : item.productId;
          const existing = variantDeductions.get(key);
          if (existing) {
            existing.quantity += qty;
          } else {
            const actualColor = color && color !== 'undefined' ? color : undefined;
            variantDeductions.set(key, { productId: item.productId, color: actualColor, quantity: qty });
          }
        }

        const colorStr = color ? `Color: ${color}` : '';
        cartDetails.push({
          productId: item.productId,
          productName: item.productName,
          quantity: qty,
          unitPrice: providedPrice,
          regularPrice,
          lineTotal,
          priceOverride: providedPrice !== regularPrice,
          priceOverrideBy: providedPrice !== regularPrice ? user.id : null,
          extras: colorStr,
          type: 'manual_standard'
        });
      }
    }

    if (payload.notes) {
      cartDetails.push({ type: 'metadata', text: `Notes: ${payload.notes}` });
    }

    const orderPayload = {
      idempotencyKey,
      orderId: generatedOrderId,
      orderDate,
      shippingName: payload.shippingName,
      shippingPhone: payload.shippingPhone,
      shippingEmail: payload.shippingEmail || '',
      shippingStreet: payload.shippingStreet || '',
      shippingCity: payload.shippingCity,
      shippingZip: payload.shippingZip || '00000',
      shippingCountry: payload.shippingCountry || 'Sri Lanka',
      totalAmount: calculatedTotal,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentStatus,
      status: 'pending',
      stock_restored: false,
      stock_snapshot: payload.deductStock 
        ? Array.from(variantDeductions.values())
        : [],
      cartDetails: JSON.stringify(cartDetails),
      items: productIdsToFetch,
    };

    const batchRequests: any[] = [];
    batchRequests.push({
      method: 'POST',
      url: '/api/collections/orders/records',
      body: orderPayload
    });

    if (payload.deductStock) {
      // 1. Group deductions by productId
      const productDeductions = new Map<string, { color?: string; quantity: number, canonicalName?: string }[]>();
      for (const deduction of variantDeductions.values()) {
        const { productId, color, quantity } = deduction;
        const dbProduct = productMap.get(productId);
        if (!dbProduct) throw new Error(`Product ${productId} not found for deduction`);
        
        const v = validateColorStock(dbProduct, color || '', quantity);
        if (!v.valid) {
          throw new Error(v.error || `Stock error for ${dbProduct.name}`);
        }
        
        const arr = productDeductions.get(productId) || [];
        arr.push({ color, quantity, canonicalName: v.canonicalName });
        productDeductions.set(productId, arr);
        
        if (v.canonicalName) {
          deduction.color = v.canonicalName;
        }
      }

      // 2. Compute one update per product
      for (const [prodId, deductionsArr] of productDeductions.entries()) {
        const dbProduct = productMap.get(prodId);
        
        if (dbProduct.inventoryMode === 'color') {
          const colorStock = { ...(dbProduct.colorStock || {}) };
          let totalDeductedGlobal = 0;
          
          for (const ded of deductionsArr) {
            const cName = ded.canonicalName || ded.color;
            if (cName && typeof colorStock[cName] === 'number') {
              colorStock[cName] -= ded.quantity;
              totalDeductedGlobal += ded.quantity;
            }
          }
          
          const newTotalQty = Object.values(colorStock).reduce((sum: number, q: any) => sum + Number(q), 0);
          
          batchRequests.push({
            method: 'PATCH',
            url: `/api/collections/products/records/${prodId}`,
            body: { colorStock, quantity: newTotalQty }
          });
          
        } else {
          const totalDeduct = deductionsArr.reduce((sum: number, d: any) => sum + d.quantity, 0);
          if (totalDeduct > 0) {
            batchRequests.push({
              method: 'PATCH',
              url: `/api/collections/products/records/${prodId}`,
              body: { "quantity-": totalDeduct }
            });
          }
        }
      }
    }

    const batchRes = await adminPb.send('/api/batch', {
      method: 'POST',
      body: { requests: batchRequests }
    });
    
    let record = null;
    if (Array.isArray(batchRes) && batchRes.length > 0 && batchRes[0].body) {
       record = batchRes[0].body;
    } else {
       record = await adminPb.collection('orders').getFirstListItem(`orderId="${generatedOrderId}"`);
    }

    return { success: true, orderId: generatedOrderId, record: structuredClone(record) };
  } catch (error: any) {
    console.error('Failed to create manual order via Batch:', error);
    if (error.response?.data) console.error("Batch validation errors:", JSON.stringify(error.response.data, null, 2));
    return { success: false, error: error?.message || 'Failed to create manual order' };
  }
}

export async function getAllOrdersAction(page: number = 1, perPage: number = 50) {
  try {
    const { pb } = await validateSession();
    const result = await pb.collection('orders').getList(page, perPage, {
      sort: '-orderDate',
      fields: 'id,collectionId,collectionName,orderId,orderDate,status,paymentStatus,totalAmount,shippingName,shippingEmail,shippingPhone,shippingStreet,shippingCity,shippingZip,shippingCountry,paymentMethod,receipt,cartDetails,user,expand',
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

export async function getCustomerOrdersAction() {
  const { getCustomerOrdersData } = await import('@/lib/data/customer-orders');
  return await getCustomerOrdersData();
}

function shouldStockBeRestored(status: string, paymentStatus: string): boolean {
  if (status === 'cancelled' || status === 'returned') return true;
  if (paymentStatus === 'refunded') return true;
  return false;
}

async function processOrderLifecycleTransition(orderId: string, newStatus: string | undefined, newPaymentStatus: string | undefined) {
  await validateSession();
  const adminPb = await getAdminClient();
  
  const order = await adminPb.collection('orders').getOne(orderId);
  const currentStatus = order.status;
  const currentPaymentStatus = order.paymentStatus;
  
  const nextStatus = newStatus !== undefined ? newStatus : currentStatus;
  const nextPaymentStatus = newPaymentStatus !== undefined ? newPaymentStatus : currentPaymentStatus;
  
  const beforeShouldRestore = shouldStockBeRestored(currentStatus, currentPaymentStatus);
  const afterShouldRestore = shouldStockBeRestored(nextStatus, nextPaymentStatus);
  
  const batchRequests: any[] = [];
  const orderUpdates: any = {};
  if (newStatus !== undefined) orderUpdates.status = newStatus;
  if (newPaymentStatus !== undefined) orderUpdates.paymentStatus = newPaymentStatus;
  
  let needsBatch = false;
  
  if (!beforeShouldRestore && afterShouldRestore) {
    if (!order.stock_restored) {
      if (!Array.isArray(order.stock_snapshot) || order.stock_snapshot.length === 0) {
        throw new Error("Stock cannot be automatically restored for this legacy order because its original inventory snapshot is unavailable.");
      }
      
      const productDeductions = new Map<string, any[]>();
      
      for (const item of order.stock_snapshot) {
        if (!item.productId || typeof item.productId !== 'string' || !item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
          throw new Error("Invalid stock snapshot format.");
        }
        
        const arr = productDeductions.get(item.productId) || [];
        arr.push(item);
        productDeductions.set(item.productId, arr);
      }
      
      for (const [prodId, items] of productDeductions.entries()) {
        const product = await adminPb.collection('products').getOne(prodId);
        
        if (product.inventoryMode === 'color') {
          const colorStock = { ...(product.colorStock || {}) };
          
          for (const item of items) {
             if (!item.color) {
               throw new Error("This is a legacy order created before color-level inventory tracking. The original color allocation is unavailable, so inventory cannot be automatically adjusted for this order.");
             }
             if (typeof colorStock[item.color] === 'number') {
                colorStock[item.color] += item.quantity;
             } else {
                throw new Error(`Color '${item.color}' is no longer configured for product '${product.name || prodId}'. Cannot safely restore inventory. Please adjust inventory mode to global or re-add the color before cancelling/refunding this order.`);
             }
          }
          
          const newTotalQty = Object.values(colorStock).reduce((sum: number, q: any) => sum + Number(q), 0);
          
          batchRequests.push({
            method: 'PATCH',
            url: `/api/collections/products/records/${prodId}`,
            body: { colorStock, quantity: newTotalQty }
          });
        } else {
           const totalRestore = items.reduce((sum: number, i: any) => sum + i.quantity, 0);
           batchRequests.push({
             method: 'PATCH',
             url: `/api/collections/products/records/${prodId}`,
             body: { "quantity+": totalRestore }
           });
        }
      }
      
      orderUpdates.stock_restored = true;
      needsBatch = true;
    }
  } else if (beforeShouldRestore && !afterShouldRestore) {
    if (order.stock_restored) {
      if (!Array.isArray(order.stock_snapshot) || order.stock_snapshot.length === 0) {
        throw new Error("Cannot safely re-deduct stock for this legacy order without an inventory snapshot.");
      }
      
      const productDeductions = new Map<string, any[]>();
      
      for (const item of order.stock_snapshot) {
        const arr = productDeductions.get(item.productId) || [];
        arr.push(item);
        productDeductions.set(item.productId, arr);
      }
      
      // Pre-check stock availability
      for (const [prodId, items] of productDeductions.entries()) {
        const product = await adminPb.collection('products').getOne(prodId);
        
        if (product.inventoryMode === 'color') {
          const colorStock = { ...(product.colorStock || {}) };
          
          for (const item of items) {
             if (!item.color) {
               throw new Error("This is a legacy order created before color-level inventory tracking. The original color allocation is unavailable, so inventory cannot be automatically adjusted for this order.");
             }
             if (typeof colorStock[item.color] !== 'number') {
                throw new Error(`Color '${item.color}' is no longer configured for product '${product.name || prodId}'. Cannot safely re-deduct inventory to reactivate this order.`);
             }
             if (colorStock[item.color] < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name || prodId} - ${item.color}.`);
             }
             colorStock[item.color] -= item.quantity;
          }
          
          const newTotalQty = Object.values(colorStock).reduce((sum: number, q: any) => sum + Number(q), 0);
          
          batchRequests.push({
            method: 'PATCH',
            url: `/api/collections/products/records/${prodId}`,
            body: { colorStock, quantity: newTotalQty }
          });
        } else {
           const totalDeduct = items.reduce((sum: number, i: any) => sum + i.quantity, 0);
           if (product.quantity < totalDeduct) {
              throw new Error(`Insufficient stock for product ${product.name || prodId} to reactivate this order.`);
           }
           batchRequests.push({
             method: 'PATCH',
             url: `/api/collections/products/records/${prodId}`,
             body: { "quantity-": totalDeduct }
           });
        }
      }
      orderUpdates.stock_restored = false;
      needsBatch = true;
    }
  }
  
  if (needsBatch) {
    batchRequests.push({
      method: 'PATCH',
      url: `/api/collections/orders/records/${orderId}`,
      body: orderUpdates
    });
    await adminPb.send('/api/batch', {
      method: 'POST',
      body: { requests: batchRequests }
    });
  } else {
    await adminPb.collection('orders').update(orderId, orderUpdates);
  }
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    await processOrderLifecycleTransition(orderId, status, undefined);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || String(error) };
  }
}

export async function updateOrderPaymentStatusAction(orderId: string, paymentStatus: string) {
  try {
    await processOrderLifecycleTransition(orderId, undefined, paymentStatus);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || String(error) };
  }
}

export async function deleteOrdersAction(orderIds: string[]) {
  try {
    const { pb } = await validateSession();
    const adminPb = await getAdminClient();

    
    const batchRequests: any[] = [];

    
    for (const orderId of orderIds) {
      batchRequests.push({
         method: 'DELETE',
         url: `/api/collections/orders/records/${orderId}`
      });
    }

    // Since deleting orders and restoring stock can be large, we might have to split batches if > 200,
    // but usually we don't delete 100 orders at once.
    if (batchRequests.length > 0) {
      await adminPb.send('/api/batch', {
        method: 'POST',
        body: { requests: batchRequests }
      });
    }

    // Realtime invalidation covers Admin UI
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete orders:', error?.message || error);
    return { success: false, error: error?.message || String(error) || 'Failed to delete orders' };
  }
}
