import { X, ChevronDown, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { PB_URL } from '@/lib/pocketbase';

export function ViewOrderModal({
  selectedOrder, setSelectedOrder, handleStatusChange, handlePaymentStatusChange
}: any) {

  // Extract source from cartDetails if present (manual orders store "Source: Instagram" as first entry)
  const cartDetailsArr: string[] = Array.isArray(selectedOrder?.cartDetails)
    ? selectedOrder.cartDetails
    : [];
  const sourceEntry = cartDetailsArr.find((d: string) => d.startsWith('Source:'));
  const source = sourceEntry ? sourceEntry.replace('Source:', '').trim() : null;
  const visibleCartDetails = cartDetailsArr.filter((d: string) => !d.startsWith('Source:'));

  const email = selectedOrder?.expand?.user?.email || selectedOrder?.shippingEmail || null;
  const phone = selectedOrder?.shippingPhone || selectedOrder?.phone || null;

  return (
    <>
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-burgundy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-burgundy/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-heading font-bold text-xl text-burgundy">Order Details</h2>
                {source && (
                  <span className="inline-block mt-1 text-[10px] px-2.5 py-0.5 rounded-full bg-burgundy/8 text-burgundy/60 font-ui font-semibold uppercase tracking-wide">
                    via {source}
                  </span>
                )}
              </div>
              <button aria-label="Close" onClick={() => setSelectedOrder(null)} className="text-burgundy/50 hover:text-burgundy p-2 rounded-full hover:bg-champagne/50 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 font-body max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">

              {/* Order ID */}
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Order ID</span>
                <span className="font-bold text-burgundy">{selectedOrder.orderId || selectedOrder.id}</span>
              </div>

              {/* Customer */}
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Customer</span>
                <span className="text-burgundy text-right">{selectedOrder.shippingName}</span>
              </div>

              {/* Phone */}
              {phone && (
                <div className="flex justify-between pb-3 border-b border-burgundy/10">
                  <span className="text-burgundy/60 flex items-center gap-1.5"><Phone size={13} /> Phone</span>
                  <a href={`tel:${phone}`} className="text-burgundy hover:underline">{phone}</a>
                </div>
              )}

              {/* Email */}
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60 flex items-center gap-1.5"><Mail size={13} /> Email</span>
                {email ? (
                  <a href={`mailto:${email}`} className="text-burgundy hover:underline">{email}</a>
                ) : (
                  <span className="text-burgundy/40 text-sm">N/A</span>
                )}
              </div>

              {/* Date */}
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Date</span>
                <span className="text-burgundy">{new Date(selectedOrder.orderDate || selectedOrder.created).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              </div>

              {/* Address */}
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60 flex items-center gap-1.5"><MapPin size={13} /> Address</span>
                <span className="text-burgundy text-right max-w-[220px]">
                  {[selectedOrder.shippingStreet, selectedOrder.shippingCity, selectedOrder.shippingZip, selectedOrder.shippingCountry].filter(Boolean).join(', ') || 'N/A'}
                </span>
              </div>

              {/* Payment */}
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Payment</span>
                <span className="text-burgundy capitalize flex items-center gap-2 flex-wrap justify-end">
                  {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                  {selectedOrder.paymentMethod === 'bank_transfer' && selectedOrder.receipt && (
                    <a
                      href={`${PB_URL}/api/files/${selectedOrder.collectionId}/${selectedOrder.id}/${selectedOrder.receipt}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 hover:underline border border-blue-200"
                    >
                      <ExternalLink size={10} /> View Receipt
                    </a>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize outline-none cursor-pointer ${selectedOrder.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {selectedOrder.paymentStatus}
                      <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePaymentStatusChange(selectedOrder.id, 'pending')}>Pending</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePaymentStatusChange(selectedOrder.id, 'paid')}>Paid</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePaymentStatusChange(selectedOrder.id, 'failed')}>Failed</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </span>
              </div>

              {/* Items */}
              <div className="pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60 block mb-2">Items</span>
                <div className="space-y-1">
                  {visibleCartDetails.length > 0 ? (
                    visibleCartDetails.map((item: string, i: number) => {
                      if (item.startsWith('Notes:')) {
                        return (
                          <div key={i} className="text-xs text-burgundy/50 italic bg-ivory/50 px-2 py-1.5 rounded mt-2">
                            {item}
                          </div>
                        );
                      }

                      if (item.includes('Custom Box')) {
                        const [mainPart, itemsPart] = item.split(' - Items: ');
                        return (
                          <div key={i} className="text-xs text-burgundy font-medium bg-ivory/50 p-3 rounded-lg border border-burgundy/10">
                            <div className="font-bold mb-1.5">{mainPart}</div>
                            {itemsPart && (
                              <ul className="list-disc pl-4 space-y-1 text-[11px] opacity-80">
                                {(itemsPart.includes(' | ') ? itemsPart.split(' | ') : itemsPart.split(', ')).map((boxItem, idx) => (
                                  <li key={idx}>{boxItem}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      }

                      let rawClean = item.split('[')[0].split(' - Rs.')[0].trim();
                      let count = '';
                      let name = rawClean;
                      const match = rawClean.match(/^(\d+)x\s+(.*)/);
                      if (match) { count = match[1]; name = match[2]; }
                      name = name.replace(/\s*\([^)]*\)$/, '').trim();
                      const extrasMatch = item.match(/\[(.*?)\]/);
                      const extras = extrasMatch ? ` (${extrasMatch[1]})` : '';
                      const countSuffix = count ? ` × ${count}` : '';

                      return (
                        <div key={i} className="text-xs text-burgundy font-medium bg-ivory/50 p-2 rounded flex justify-between">
                          <span>{name}{extras}{countSuffix}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-burgundy/40">No items recorded</div>
                  )}
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Total Amount</span>
                <span className="font-bold text-burgundy">Rs. {Number(selectedOrder.totalAmount || 0).toLocaleString()}</span>
              </div>

              {/* Order Status */}
              <div className="flex justify-between items-center">
                <span className="text-burgundy/60">Order Status</span>
                <DropdownMenu>
                  <DropdownMenuTrigger className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold capitalize outline-none cursor-pointer text-center ${
                    selectedOrder.status === 'pending' || selectedOrder.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                    selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                    selectedOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedOrder.status}
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(selectedOrder.id, 'pending')}>Pending</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(selectedOrder.id, 'processing')}>Processing</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(selectedOrder.id, 'shipped')}>Shipped</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}>Delivered</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}>Cancelled</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-burgundy/5 mt-6">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 font-ui font-semibold text-burgundy/70 hover:text-burgundy transition-colors rounded-xl hover:bg-burgundy/5"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
