import { X, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { PB_URL } from '@/lib/pocketbase';

export function ViewOrderModal({
  selectedOrder, setSelectedOrder, handleStatusChange, handlePaymentStatusChange
}: any) {
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
              <h2 className="font-heading font-bold text-xl text-burgundy">Order Details</h2>
              <button aria-label="Action" onClick={() => setSelectedOrder(null)} className="text-burgundy/50 hover:text-burgundy p-2 rounded-full hover:bg-champagne/50 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 font-body max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Order ID</span>
                <span className="font-bold text-burgundy">{selectedOrder.orderId || selectedOrder.id}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Customer</span>
                <span className="text-burgundy text-right">{selectedOrder.shippingName}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Email</span>
                <span className="text-burgundy">{selectedOrder.expand?.user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Date</span>
                <span className="text-burgundy">{new Date(selectedOrder.orderDate || selectedOrder.created).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              </div>
              
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Address</span>
                <span className="text-burgundy text-right max-w-[200px]">
                  {[selectedOrder.shippingStreet, selectedOrder.shippingCity, selectedOrder.shippingZip, selectedOrder.shippingCountry].filter(Boolean).join(', ')}
                </span>
              </div>
              
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Payment</span>
                <span className="text-burgundy capitalize flex items-center">
                  {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                  {selectedOrder.paymentMethod === 'bank_transfer' && selectedOrder.receipt && (
                    <a 
                      href={`${PB_URL}/api/files/${selectedOrder.collectionId}/${selectedOrder.id}/${selectedOrder.receipt}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 hover:underline border border-blue-200"
                    >
                      View Receipt
                    </a>
                  )}
                  <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${selectedOrder.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </span>
              </div>
              
              <div className="pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60 block mb-2">Items</span>
                <div className="space-y-1">
                  {Array.isArray(selectedOrder.cartDetails) ? (
                    selectedOrder.cartDetails.map((item: string, i: number) => {
                      if (item.includes('Custom Box')) {
                        const [mainPart, itemsPart] = item.split(' - Items: ');
                        return (
                        <div key={item} className="text-xs text-burgundy font-medium bg-ivory/50 p-3 rounded-lg border border-burgundy/10">
                            <div className="font-bold mb-1.5">{mainPart}</div>
                            {itemsPart && (
                              <ul className="list-disc pl-4 space-y-1 text-[11px] opacity-80">
                                {(itemsPart.includes(' | ') ? itemsPart.split(' | ') : itemsPart.split(', ')).map((boxItem, idx) => (
                                  <li key={boxItem}>{boxItem}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      }

                      let rawClean = item.split('[')[0].split(' - Rs.')[0].trim();
                      let count = "";
                      let name = rawClean;
                      const match = rawClean.match(/^(\d+)x\s+(.*)/);
                      if (match) {
                        count = match[1];
                        name = match[2];
                      }
                      
                      name = name.replace(/\s*\([^)]*\)$/, '').trim();
                      
                      let productCode = "";
                      if (selectedOrder.expand?.items) {
                        const matchedProduct = selectedOrder.expand.items.find((p: any) => name.includes(p.name) || p.name.includes(name));
                        if (matchedProduct?.productCode) {
                          productCode = matchedProduct.productCode;
                        }
                      }
                      
                      const codeMatch = rawClean.match(/\(([^)]+)\)$/);
                      if (!productCode && codeMatch) {
                        productCode = codeMatch[1];
                      }

                      const extrasMatch = item.match(/\[(.*?)\]/);
                      const extras = extrasMatch ? ` (${extrasMatch[1]})` : "";

                      const codePrefix = productCode ? `${productCode} - ` : "";
                      const countSuffix = count ? ` x ${count}` : "";
                      const finalItem = `${codePrefix}${name}${countSuffix}${extras}`;
                      
                      return (
                        <div key={item} className="text-xs text-burgundy font-medium bg-ivory/50 p-2 rounded">
                          {finalItem}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-burgundy">No items recorded</div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Total Amount</span>
                <span className="font-bold text-burgundy">Rs. {Number(selectedOrder.totalAmount || 0).toLocaleString()}</span>
              </div>
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
