import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatPrice } from '@/lib/utils';

export function OrderSummary({ items, subtotal, shipping, total }: any) {
  return (
    <div className="lg:col-span-2">
      <div className="glass-card rounded-3xl p-6 sticky top-28">
        <h3 className="font-heading text-lg font-bold text-burgundy mb-4">Order Summary</h3>
        <ScrollArea className="h-48 mb-4 pr-4">
          <div className="space-y-3">
            {items.map((item: any) => (
              <div key={item.cartItemId} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl bg-champagne/30 overflow-hidden flex-shrink-0">
                  <Image src={item.product.images[0]} alt="" fill sizes="48px" className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-ui text-xs font-semibold text-burgundy truncate">{item.product.name}</p>
                  {item.isCustomBox ? (
                    <p className="font-body text-[10px] text-burgundy/40">
                      Qty: {item.quantity} • {item.boxItems?.length || 0} items
                    </p>
                  ) : (
                    <p className="font-body text-[10px] text-burgundy/40">
                      Qty: {item.quantity}{item.selectedColor ? ` • ${item.selectedColor}` : ''}
                    </p>
                  )}
                </div>
                <span className="font-ui text-xs font-bold text-burgundy">
                  {formatPrice((item.customPrice ?? item.product.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t border-nude/30 pt-3 space-y-2">
          <div className="flex justify-between">
            <span className="font-body text-sm text-burgundy/50">Subtotal</span>
            <span className="font-ui text-sm font-semibold text-burgundy">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-body text-sm text-burgundy/50">Delivery</span>
            <span className="font-ui text-sm font-semibold text-burgundy">
              {shipping === 0 ? (
                <span className="flex items-center gap-2">
                  <span className="line-through text-burgundy/40 opacity-70">Rs. 450</span>
                  <span>Free</span>
                </span>
              ) : (
                formatPrice(shipping)
              )}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-nude/30">
            <span className="font-ui font-bold text-burgundy">Total</span>
            <span className="font-ui font-bold text-xl text-burgundy">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
