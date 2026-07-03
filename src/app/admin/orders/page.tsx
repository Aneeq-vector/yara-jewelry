'use client';

import { useState } from 'react';
import { Search, Filter, Eye, Download, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const mockOrders = [
  { id: '#YR-2455', customer: 'Emma Thompson', email: 'emma.t@example.com', date: 'Oct 24, 2026', total: 'Rs. 45,000', status: 'Processing', items: 2 },
  { id: '#YR-2454', customer: 'James Wilson', email: 'j.wilson@example.com', date: 'Oct 24, 2026', total: 'Rs. 125,000', status: 'Shipped', items: 1 },
  { id: '#YR-2453', customer: 'Sarah Davis', email: 'sarah.d@example.com', date: 'Oct 23, 2026', total: 'Rs. 12,500', status: 'Delivered', items: 3 },
  { id: '#YR-2452', customer: 'Michael Brown', email: 'mbrown99@example.com', date: 'Oct 23, 2026', total: 'Rs. 85,000', status: 'Processing', items: 1 },
  { id: '#YR-2451', customer: 'Emily Chen', email: 'emily.chen@example.com', date: 'Oct 22, 2026', total: 'Rs. 320,000', status: 'Delivered', items: 4 },
];

export default function OrdersManager() {
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);

  const handleExport = () => {
    alert('Exporting orders to CSV...');
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-burgundy">Orders History</h1>
          <p className="text-burgundy/60 font-body text-sm mt-1">View and manage all customer orders.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-white border border-burgundy/10 text-burgundy px-4 py-2 rounded-xl font-ui text-sm font-semibold hover:bg-rose-gold/10 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-burgundy/5 flex flex-col sm:flex-row justify-between gap-4 bg-ivory/30">
          <div className="flex items-center gap-2 bg-white border border-burgundy/10 rounded-xl px-4 py-2 w-full sm:w-80 focus-within:border-burgundy/30 transition-colors">
            <Search size={16} className="text-burgundy/40" />
            <input 
              type="text" 
              placeholder="Search by order ID or customer..." 
              className="bg-transparent border-none outline-none text-sm text-burgundy placeholder:text-burgundy/40 w-full font-body"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white border border-burgundy/10 text-burgundy px-4 py-2 rounded-xl font-ui text-sm font-medium hover:bg-rose-gold/10 transition-colors">
              <Filter size={16} />
              Filter
            </button>
            <select className="bg-white border border-burgundy/10 text-burgundy text-sm rounded-xl px-4 py-2 font-body outline-none focus:border-burgundy/30 transition-colors cursor-pointer">
              <option>All Statuses</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-burgundy/10 text-burgundy/60 font-body text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold w-12">
                  <Checkbox className="rounded border-burgundy/20 text-burgundy focus:ring-burgundy" />
                </th>
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Total</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm font-body">
              {mockOrders.map((order) => (
                <tr key={order.id} className="border-b border-burgundy/5 last:border-0 hover:bg-ivory/30 transition-colors cursor-pointer">
                  <td className="p-4">
                    <Checkbox className="rounded border-burgundy/20 text-burgundy focus:ring-burgundy" />
                  </td>
                  <td className="p-4 font-ui font-bold text-burgundy">
                    {order.id}
                    <div className="text-xs text-burgundy/50 font-normal mt-0.5">{order.items} items</div>
                  </td>
                  <td className="p-4 font-ui text-burgundy/80">{order.date}</td>
                  <td className="p-4">
                    <div className="font-medium text-burgundy">{order.customer}</div>
                    <div className="text-xs text-burgundy/50">{order.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'Processing' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 font-ui font-bold text-burgundy text-right">
                    {order.total}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-burgundy/10 rounded-lg text-burgundy hover:bg-rose-gold/10 transition-colors text-xs font-medium"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-burgundy/5 bg-ivory/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-burgundy/60 font-body">
            <span>Rows per page:</span>
            <select defaultValue="25" className="bg-transparent border border-burgundy/10 rounded-md px-2 py-1 outline-none focus:border-burgundy/30 cursor-pointer text-burgundy">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="ml-4">1-{mockOrders.length} of {mockOrders.length}</span>
          </div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* View Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-burgundy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-burgundy/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading font-bold text-xl text-burgundy">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-burgundy/50 hover:text-burgundy p-2 rounded-full hover:bg-champagne/50 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 font-body">
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Order ID</span>
                <span className="font-bold text-burgundy">{selectedOrder.id}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Customer</span>
                <span className="text-burgundy">{selectedOrder.customer}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Email</span>
                <span className="text-burgundy">{selectedOrder.email}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Date</span>
                <span className="text-burgundy">{selectedOrder.date}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Items</span>
                <span className="text-burgundy">{selectedOrder.items}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-burgundy/10">
                <span className="text-burgundy/60">Total</span>
                <span className="font-bold text-burgundy">{selectedOrder.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-burgundy/60">Status</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  {selectedOrder.status}
                </span>
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
    </div>
  );
}
