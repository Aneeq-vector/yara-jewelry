import { ShoppingBag } from 'lucide-react';
import { getServerClient } from '@/lib/pocketbase-server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const statusColors: Record<string, string> = {
  processing: 'bg-amber-100 text-amber-700',
  pending: 'bg-amber-100 text-amber-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default async function OrdersPage() {
  const pb = await getServerClient();
  
  if (!pb.authStore.isValid || !pb.authStore.record) {
    redirect('/auth/login');
  }

  const userId = pb.authStore.record.id;
  let orders: any[] = [];

  try {
    const res = await pb.collection('orders').getList(1, 50, {
      filter: `user="${userId}"`,
      expand: 'items'
    });
    orders = res.items;
  } catch (err) {}

  return (
    <>
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-burgundy mb-2">My Orders</h1>
        <p className="font-body text-burgundy/50">View and track your recent orders.</p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-sm text-burgundy/60 font-body">You have no orders yet.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="glass-card rounded-3xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-ui font-bold text-sm text-burgundy">{order.orderId || `#${order.id.slice(0, 8)}`}</p>
                  <p className="font-body text-xs text-burgundy/40">
                    {new Date(order.orderDate ? order.orderDate.replace(' ', 'T') : (order.created ? order.created.replace(' ', 'T') : Date.now())).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-ui font-bold uppercase tracking-wider ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                  {order.status || 'Pending'}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {(order.cartDetails || []).map((detail: string, idx: number) => {
                  if (detail.includes('Custom Box')) {
                    const [mainPart, itemsPart] = detail.split(' - Items: ');
                    return (
                      <div key={idx} className="flex flex-col gap-2 p-3 rounded-xl bg-champagne/20 overflow-hidden text-sm text-burgundy">
                        <div className="font-bold px-1">{mainPart}</div>
                        {itemsPart && (
                          <div className="flex flex-col gap-2">
                            {(itemsPart.includes(' | ') ? itemsPart.split(' | ') : itemsPart.split(', ')).map((boxItem, itemIdx) => (
                              <div key={itemIdx} className="flex items-center gap-3 p-2 rounded-xl bg-champagne/40 overflow-hidden">
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

                  let rawClean = detail.split('[')[0].split(' - Rs.')[0].trim();
                  let count = "";
                  let name = rawClean;
                  const match = rawClean.match(/^(\d+)x\s+(.*)/);
                  if (match) {
                    count = match[1];
                    name = match[2];
                  }
                  
                  name = name.replace(/\s*\([^)]*\)$/, '').trim();
                  
                  let productCode = "";
                  if (order.expand?.items) {
                    const matchedProduct = order.expand.items.find((p: any) => name.includes(p.name) || p.name.includes(name));
                    if (matchedProduct?.productCode) {
                      productCode = matchedProduct.productCode;
                    }
                  }
                  
                  const codeMatch = rawClean.match(/\(([^)]+)\)$/);
                  if (!productCode && codeMatch) {
                    productCode = codeMatch[1];
                  }

                  const extrasMatch = detail.match(/\[(.*?)\]/);
                  const extras = extrasMatch ? ` (${extrasMatch[1]})` : "";

                  const codePrefix = productCode ? `${productCode} - ` : "";
                  const countSuffix = count ? ` x ${count}` : "";
                  const finalItem = `${codePrefix}${name}${countSuffix}${extras}`;
                  
                  return (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-champagne/20 overflow-hidden">
                      <ShoppingBag size={14} className="text-burgundy/30 flex-shrink-0" />
                      <span className="font-body text-sm text-burgundy/60 truncate flex-1 min-w-0" title={finalItem}>{finalItem}</span>
                    </div>
                  );
                })}
                {!(order.cartDetails?.length) && order.expand?.items?.map((item: any, idx: number) => (
                  <div key={`fallback-${idx}`} className="flex items-center gap-3 p-2 rounded-xl bg-champagne/20 overflow-hidden">
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
    </>
  );
}
