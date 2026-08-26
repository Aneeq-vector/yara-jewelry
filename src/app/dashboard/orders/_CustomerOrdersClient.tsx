'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, AlertCircle } from 'lucide-react';
import { queryKeys } from '@/lib/query-keys';
import CustomerRealtimeProvider from '@/lib/providers/customer-realtime-provider';
import { getCustomerOrdersAction } from '@/app/actions/orders';

const statusColors: Record<string, string> = {
  processing: 'bg-amber-100 text-amber-700',
  pending: 'bg-amber-100 text-amber-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

async function fetchUserOrders() {
  const res = await getCustomerOrdersAction();
  if (!res.success) {
    throw new Error(res.error || 'Failed to load orders');
  }
  return res.orders || [];
}

export default function CustomerOrdersClient({
  userId,
  authToken,
  initialOrders,
}: {
  userId: string;
  authToken: string;
  initialOrders: any[];
}) {


  const { data: orders = initialOrders, error, isError } = useQuery({
    queryKey: queryKeys.orders.user(userId),
    queryFn: () => fetchUserOrders(),
    initialData: initialOrders,
  });

  return (
    <CustomerRealtimeProvider authToken={authToken} userId={userId}>
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-burgundy mb-2">My Orders</h1>
        <p className="font-body text-burgundy/50">View and track your recent orders.</p>
      </div>

      <div className="space-y-4">
        {isError ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl">
            <AlertCircle size={20} />
            <p className="text-sm font-body font-medium">Failed to load orders. Please refresh the page.</p>
          </div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-burgundy/60 font-body">You have no orders yet.</p>
        ) : (
          orders.map((order: any) => (
            <div key={order.id} className="glass-card rounded-3xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-ui font-bold text-sm text-burgundy">{order.orderId || `#${order.id.slice(0, 8)}`}</p>
                  <p suppressHydrationWarning className="font-body text-xs text-burgundy/40">
                    {new Date(order.orderDate ? order.orderDate.replace(' ', 'T') : (order.created ? order.created.replace(' ', 'T') : '2024-01-01T00:00:00Z')).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-ui font-bold uppercase tracking-wider ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                  {order.status || 'Pending'}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {(order.cartDetails || []).map((detailRaw: any, idx: number) => {
                  // Normalize legacy strings vs new objects
                  const isObject = typeof detailRaw === 'object' && detailRaw !== null;
                  
                  const isCustomBox = isObject 
                    ? detailRaw.type === 'custom_box' 
                    : typeof detailRaw === 'string' && detailRaw.includes('Custom Box');
                  
                  if (isCustomBox) {
                    let mainPart = '';
                    let itemsArr: string[] = [];
                    
                    if (isObject) {
                      mainPart = `${detailRaw.quantity}x ${detailRaw.productName} - Rs. ${detailRaw.lineTotal}`;
                      itemsArr = Array.isArray(detailRaw.boxItems) ? detailRaw.boxItems : [];
                    } else if (typeof detailRaw === 'string') {
                      const [splitMain, itemsPart] = detailRaw.split(' - Items: ');
                      mainPart = splitMain;
                      if (itemsPart) {
                        itemsArr = itemsPart.includes(' | ') ? itemsPart.split(' | ') : itemsPart.split(', ');
                      }
                    }

                    return (
                      <div key={`box-${idx}`} className="flex flex-col gap-2 p-3 rounded-xl bg-champagne/20 overflow-hidden text-sm text-burgundy">
                        <div className="font-bold px-1">{mainPart}</div>
                        {itemsArr.length > 0 && (
                          <div className="flex flex-col gap-2">
                            {itemsArr.map((boxItem: string) => (
                              <div key={boxItem} className="flex items-center gap-3 p-2 rounded-xl bg-champagne/40 overflow-hidden">
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-ivory rounded-lg text-burgundy/40">
                                  <ShoppingBag size={14} />
                                </div>
                                <p className="font-body text-sm text-burgundy/80 font-medium truncate flex-1 min-w-0">
                                  {boxItem}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  let count = "1";
                  let name = "";
                  let productCode = "";
                  let lineTotal = "";
                  
                  if (isObject) {
                    count = String(detailRaw.quantity || "1");
                    name = detailRaw.productName || "";
                    lineTotal = detailRaw.lineTotal ? ` - Rs. ${detailRaw.lineTotal}` : "";
                    if (order.expand?.items) {
                      const matchedProduct = order.expand.items.find((p: any) => p.id === detailRaw.productId);
                      if (matchedProduct?.productCode) {
                        productCode = matchedProduct.productCode;
                      }
                    }
                  } else if (typeof detailRaw === 'string') {
                    let rawClean = detailRaw.split('[')[0].split(' - Rs.')[0].trim();
                    name = rawClean;
                    const match = rawClean.match(/^(\d+)x\s+(.*)/);
                    if (match) {
                      count = match[1];
                      name = match[2];
                    }
                    
                    name = name.replace(/\s*\([^)]*\)$/, '').trim();
                    
                    if (order.expand?.items) {
                      const safeName = name || "";
                      const matchedProduct = order.expand.items.find((p: any) => 
                        (safeName && p.name && (safeName.includes(p.name) || p.name.includes(safeName)))
                      );
                      if (matchedProduct?.productCode) {
                        productCode = matchedProduct.productCode;
                      }
                    }
                    
                    const codeMatch = rawClean.match(/\(([^)]+)\)$/);
                    if (!productCode && codeMatch) {
                      productCode = codeMatch[1];
                    }
                  }

                  let extras = "";
                  if (isObject) {
                    extras = detailRaw.extras ? ` (${detailRaw.extras})` : "";
                  } else if (typeof detailRaw === 'string') {
                    const extrasMatch = detailRaw.match(/\[(.*?)\]/);
                    extras = extrasMatch ? ` (${extrasMatch[1]})` : "";
                  }

                  const codePrefix = productCode ? `${productCode} - ` : "";
                  const countSuffix = count ? ` x ${count}` : "";
                  const finalItem = `${codePrefix}${name}${countSuffix}${extras}${lineTotal}`;
                  const safeKey = typeof detailRaw === 'string' ? detailRaw : `item-${idx}`;
                  
                  return (
                    <div key={safeKey} className="flex items-center gap-3 p-2 rounded-xl bg-champagne/20 overflow-hidden">
                      <ShoppingBag size={14} className="text-burgundy/30 flex-shrink-0" />
                      <span className="font-body text-sm text-burgundy/60 truncate flex-1 min-w-0" title={finalItem}>{finalItem}</span>
                    </div>
                  );
                })}
                {!(order.cartDetails?.length) && order.expand?.items?.map((item: any, idx: number) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl bg-champagne/20 overflow-hidden">
                    <ShoppingBag size={14} className="text-burgundy/30 flex-shrink-0" />
                    <span className="font-body text-sm text-burgundy/60 truncate flex-1 min-w-0">{item.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-nude/30">
                <span className="font-body text-sm text-burgundy/50">{(order.cartDetails || order.items || []).length} items</span>
                <span className="font-ui font-bold text-burgundy">Rs. {order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </CustomerRealtimeProvider>
  );
}
