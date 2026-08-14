'use client';

import { useState, useEffect, useMemo } from 'react';
import { OrdersTable } from './components/OrdersTable';
import { OrdersPagination } from './components/OrdersPagination';
import { ViewOrderModal } from './components/ViewOrderModal';
import { TableSkeleton } from '@/components/admin/TableSkeleton';
import { Search, Filter, Eye, Download, X, Loader2, ChevronDown, FileText, Trash2, RefreshCw, Plus } from 'lucide-react';
import { AddOrderModal } from './components/AddOrderModal';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAllOrdersAction, updateOrderStatusAction, updateOrderPaymentStatusAction, deleteOrdersAction } from '@/app/actions/orders';
import { useAdminOrders } from '@/lib/hooks/use-orders';
import { queryKeys } from '@/lib/query-keys';
import { useQueryClient } from '@tanstack/react-query';
import { PB_URL } from '@/lib/pocketbase';
import * as XLSX from 'xlsx';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function OrdersClient({ initialOrders, initialTotal, initialPages }: {
  initialOrders: any[];
  initialTotal: number;
  initialPages: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  
  const { data, isFetching: loading, refetch } = useAdminOrders(currentPage, rowsPerPage);
  const orders = data?.orders || initialOrders;
  const totalItems = data?.totalItems ?? initialTotal;
  const totalPages = data?.totalPages ?? initialPages;
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDate, setCustomDate] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  const fetchOrders = () => {
    refetch();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const qKey = queryKeys.admin.orders(currentPage, rowsPerPage);
    queryClient.setQueryData(qKey, (old: any) => {
      if (!old) return old;
      return { ...old, orders: old.orders.map((o: any) => o.id === id ? { ...o, status: newStatus } : o) };
    });
    setSelectedOrder((prev: any) => prev && prev.id === id ? { ...prev, status: newStatus } : prev);
    
    const res = await updateOrderStatusAction(id, newStatus);
    if (!res?.success) {
      alert("Failed to update status: " + (res?.error || "Unknown error"));
      queryClient.invalidateQueries({ queryKey: qKey });
    }
  };

  const handlePaymentStatusChange = async (id: string, newPaymentStatus: string) => {
    const qKey = queryKeys.admin.orders(currentPage, rowsPerPage);
    queryClient.setQueryData(qKey, (old: any) => {
      if (!old) return old;
      return { ...old, orders: old.orders.map((o: any) => o.id === id ? { ...o, paymentStatus: newPaymentStatus } : o) };
    });
    setSelectedOrder((prev: any) => prev && prev.id === id ? { ...prev, paymentStatus: newPaymentStatus } : prev);
    
    const res = await updateOrderPaymentStatusAction(id, newPaymentStatus);
    if (!res?.success) {
      alert("Failed to update payment status: " + (res?.error || "Unknown error"));
      queryClient.invalidateQueries({ queryKey: qKey });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedOrders.length === 0) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Orders',
      message: `Are you sure you want to delete ${selectedOrders.length} order(s)? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        const res = await deleteOrdersAction(selectedOrders);
        if (res?.success) {
          const qKey = queryKeys.admin.orders(currentPage, rowsPerPage);
          queryClient.invalidateQueries({ queryKey: qKey });
          setSelectedOrders([]);
        } else {
          alert("Failed to delete orders: " + (res?.error || "Unknown error"));
        }
      }
    });
  };

  const handleExport = () => {
    if (filteredOrders.length === 0) {
      alert("No orders to export.");
      return;
    }

    const exportData = filteredOrders.map(order => {
      const date = new Date(order.orderDate || order.created).toLocaleDateString('en-GB');
      const items = Array.isArray(order.cartDetails) ? order.cartDetails.join(" | ") : "";
      const address = [order.shippingStreet, order.shippingCity, order.shippingZip, order.shippingCountry].filter(Boolean).join(", ");
      
      return {
        "Order ID": order.orderId || order.id,
        "Date": date,
        "Customer Name": order.shippingName || "Guest",
        "Customer Email": order.expand?.user?.email || "N/A",
        "Address": address,
        "Order Status": order.status,
        "Payment Status": order.paymentStatus || "pending",
        "Total (Rs)": order.totalAmount || 0,
        "Items": items
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    
    // Generate buffer and trigger download
    XLSX.writeFile(workbook, `yara_orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Client-side filtering is applied on the current page of results
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        (order.orderId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.shippingName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.expand?.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        
      const statusMatch = statusFilter === 'All Statuses' || 
        order.status.toLowerCase() === statusFilter.toLowerCase();
        
      let dateMatch = true;
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.orderDate || order.created);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const orderDay = new Date(orderDate);
        orderDay.setHours(0, 0, 0, 0);

        if (dateFilter === 'today') {
          dateMatch = orderDay.getTime() === today.getTime();
        } else if (dateFilter === 'yesterday') {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          dateMatch = orderDay.getTime() === yesterday.getTime();
        } else if (dateFilter === 'week') {
          const lastWeek = new Date(today);
          lastWeek.setDate(lastWeek.getDate() - 7);
          dateMatch = orderDate >= lastWeek;
        } else if (dateFilter === 'month') {
          const lastMonth = new Date(today);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          dateMatch = orderDate >= lastMonth;
        } else if (dateFilter === 'custom' && customDate) {
          const custom = new Date(customDate);
          custom.setHours(0, 0, 0, 0);
          dateMatch = orderDay.getTime() === custom.getTime();
        }
      }
        
      return matchesSearch && statusMatch && dateMatch;
    });
  }, [orders, searchQuery, statusFilter, dateFilter, customDate]);

  // All filtered results shown directly (server already paginated)
  const paginatedOrders = filteredOrders;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setSelectedOrders([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(paginatedOrders.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, id]);
    } else {
      setSelectedOrders(prev => prev.filter(orderId => orderId !== id));
    }
  };

  const isAllSelected = paginatedOrders.length > 0 && selectedOrders.length === paginatedOrders.length;

  if (loading) {
    return <TableSkeleton columns={7} rows={8} />;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-burgundy">Orders History</h1>
          <p className="text-burgundy/60 font-body text-sm mt-1">View and manage all customer orders.</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-burgundy/10 text-burgundy px-4 py-2 rounded-xl font-ui text-sm font-semibold hover:bg-rose-gold/10 transition-colors shadow-sm"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={() => setIsAddOrderOpen(true)}
            className="flex items-center gap-2 bg-burgundy text-white px-4 py-2 rounded-xl font-ui text-sm font-semibold hover:bg-wine transition-colors shadow-md shadow-burgundy/20"
          >
            <Plus size={16} />
            Add Order
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-burgundy/5 flex flex-col sm:flex-row justify-between gap-4 bg-ivory/30">
          <div className="flex items-center gap-2 bg-white border border-burgundy/10 rounded-xl px-4 py-2 w-full sm:w-80 focus-within:border-burgundy/30 transition-colors">
            <Search size={16} className="text-burgundy/40" />
            <input aria-label="Search by order ID or customer..." 
              type="text" 
              placeholder="Search by order ID or customer..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none outline-none text-sm text-burgundy placeholder:text-burgundy/40 w-full font-body"
            />
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchOrders()}
              className="px-3 py-2 text-burgundy/60 hover:text-burgundy hover:bg-burgundy/5 rounded-full transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
              title="Refresh Orders"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            {selectedOrders.length > 0 && (
              <button 
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl font-ui text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
                Delete ({selectedOrders.length})
              </button>
            )}
            {dateFilter === 'custom' && (
              <input aria-label="Action" 
                type="date" 
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-burgundy/10 text-burgundy text-sm rounded-xl px-3 py-2 font-body outline-none focus:border-burgundy/30 transition-colors"
              />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 bg-white border border-burgundy/10 text-burgundy px-4 py-2 rounded-xl font-ui text-sm font-medium hover:bg-rose-gold/10 transition-colors outline-none">
                <Filter size={16} />
                {dateFilter === 'all' ? 'Filter' : 
                 dateFilter === 'today' ? 'Today' : 
                 dateFilter === 'yesterday' ? 'Yesterday' :
                 dateFilter === 'week' ? 'Last 7 Days' :
                 dateFilter === 'month' ? 'Last 30 Days' :
                 'Custom Date'}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => { setDateFilter('all'); setCurrentPage(1); }}>All Time</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setDateFilter('today'); setCurrentPage(1); }}>Today</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setDateFilter('yesterday'); setCurrentPage(1); }}>Yesterday</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setDateFilter('week'); setCurrentPage(1); }}>Last 7 Days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setDateFilter('month'); setCurrentPage(1); }}>Last 30 Days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setDateFilter('custom'); setCurrentPage(1); }}>Custom Date...</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className="bg-white border border-burgundy/10 text-burgundy text-sm rounded-xl px-4 py-2 font-body outline-none focus:border-burgundy/30 transition-colors cursor-pointer flex items-center gap-2">
                {statusFilter === 'All Statuses' ? 'All Statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} <ChevronDown size={16} className="text-burgundy/50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white border border-burgundy/10 rounded-xl shadow-lg p-1">
                {['All Statuses', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                  <DropdownMenuItem 
                    key={status}
                    onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                    className="cursor-pointer text-sm text-burgundy focus:bg-rose-gold/10 hover:bg-rose-gold/10 rounded-md px-3 py-2 outline-none"
                  >
                    {status === 'All Statuses' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <OrdersTable paginatedOrders={paginatedOrders} isAllSelected={isAllSelected} handleSelectAll={handleSelectAll} selectedOrders={selectedOrders} handleSelectOrder={handleSelectOrder} handleStatusChange={handleStatusChange} handlePaymentStatusChange={handlePaymentStatusChange} setSelectedOrder={setSelectedOrder} />
        
        {/* Pagination */}
        <OrdersPagination rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} setCurrentPage={setCurrentPage} currentPage={currentPage} totalPages={totalPages} handlePageChange={handlePageChange} filteredOrders={filteredOrders} />
      </div>

      {/* View Order Modal */}
      {selectedOrder && (
        <ViewOrderModal
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
          handleStatusChange={handleStatusChange}
          handlePaymentStatusChange={handlePaymentStatusChange}
        />
      )}
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        variant="danger"
      />

      <AddOrderModal
        isOpen={isAddOrderOpen}
        onClose={() => setIsAddOrderOpen(false)}
        onOrderCreated={() => {
          // Invalidate the current page so the new order appears
          queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders(currentPage, rowsPerPage) });
        }}
      />
    </div>
  );
}
