import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown, Eye, FileText } from 'lucide-react';
import { getReceiptUrl } from '@/lib/pocketbase';

export function OrdersTable({
  paginatedOrders, isAllSelected, handleSelectAll, selectedOrders, handleSelectOrder,
  handleStatusChange, handlePaymentStatusChange, setSelectedOrder
}: any) {
  return (
    <>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-burgundy/10 text-burgundy/60 font-body text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold w-12 align-middle">
                  <div className="flex items-center">
                    <Checkbox 
                      className="rounded border-burgundy/20 text-burgundy focus:ring-burgundy" 
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th className="p-4 font-semibold text-left align-middle">Order ID</th>
                <th className="p-4 font-semibold text-center align-middle">Date</th>
                <th className="p-4 font-semibold text-center align-middle">Customer</th>
                <th className="p-4 font-semibold text-center align-middle">Status</th>
                <th className="p-4 font-semibold text-center align-middle">Payment</th>
                <th className="p-4 font-semibold text-center align-middle">Receipt</th>
                <th className="p-4 font-semibold text-right align-middle">Total</th>
                <th className="p-4 font-semibold text-right align-middle">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm font-body">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-burgundy/50 font-body">
                    No orders found.
                  </td>
                </tr>
              ) : (() => {
                const selectedSet = new Set(selectedOrders);
                return paginatedOrders.map((order: any) => {
                const itemsCount = Array.isArray(order.cartDetails) ? order.cartDetails.length : 0;
                const orderDate = new Date(order.orderDate || order.created).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const total = Number(order.totalAmount || 0);

                return (
                  <tr key={order.id} className="border-b border-burgundy/5 last:border-0 hover:bg-ivory/30 transition-colors cursor-pointer">
                    <td className="p-4 align-middle" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center">
                        <Checkbox 
                          className="rounded border-burgundy/20 text-burgundy focus:ring-burgundy" 
                          checked={selectedSet.has(order.id)}
                          onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                        />
                      </div>
                    </td>
                    <td className="p-4 font-ui font-bold text-burgundy text-left align-middle">
                      {order.orderId || order.id}
                      <div className="text-xs text-burgundy/50 font-normal mt-0.5">{itemsCount} items</div>
                    </td>
                    <td className="p-4 font-ui text-burgundy/80 text-center align-middle">{orderDate}</td>
                    <td className="p-4 text-center align-middle">
                      <div className="font-medium text-burgundy">{order.shippingName || 'Guest'}</div>
                      <div className="text-xs text-burgundy/50">
                        {typeof order.shippingEmail === 'string' && order.shippingEmail.trim()
                          ? order.shippingEmail
                          : typeof order.expand?.user?.email === 'string' && order.expand.user.email.trim()
                            ? order.expand.user.email
                            : 'N/A'}
                      </div>
                    </td>
                    <td className="p-4 text-center align-middle">
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold capitalize outline-none cursor-pointer text-center ${
                              order.status === 'pending' || order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {order.status}
                              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'pending')}>Pending</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'processing')}>Processing</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'shipped')}>Shipped</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'delivered')}>Delivered</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'cancelled')}>Cancelled</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'returned')}>Returned</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                    <td className="p-4 text-center align-middle">
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold capitalize outline-none cursor-pointer text-center ${
                              order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                              order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {order.paymentStatus || 'pending'}
                              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePaymentStatusChange(order.id, 'pending')}>Pending</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePaymentStatusChange(order.id, 'paid')}>Paid</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePaymentStatusChange(order.id, 'refunded')}>Refunded</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePaymentStatusChange(order.id, 'failed')}>Failed</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                    <td className="p-4 text-center align-middle">
                      {order.receipt ? (
                        <a 
                          href={getReceiptUrl(order) || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-burgundy/10 rounded-lg text-burgundy hover:bg-rose-gold/10 transition-colors text-xs font-medium"
                        >
                          <FileText size={14} />
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-burgundy/40">N/A</span>
                      )}
                    </td>
                    <td className="p-4 font-ui font-bold text-burgundy text-right align-middle">
                      Rs. {total.toLocaleString()}
                    </td>
                    <td className="p-4 text-right align-middle">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-burgundy/10 rounded-lg text-burgundy hover:bg-rose-gold/10 transition-colors text-xs font-medium"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              });
            })()}
            </tbody>
          </table>
        </div>

    </>
  );
}
