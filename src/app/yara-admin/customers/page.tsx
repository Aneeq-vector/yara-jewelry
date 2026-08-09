'use client';

import { useState, useEffect } from 'react';
import { CustomersPagination } from './components/CustomersPagination';
import { AddressModal } from './components/AddressModal';
import { CustomersTable } from './components/CustomersTable';
import { Search, Download, MoreVertical, Mail, Trash2, RefreshCw, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { getCustomersAction, deleteCustomerAction, updateCustomerStatusAction, deleteCustomersAction } from '@/app/actions/customers';
import { Customer } from '@/lib/store/customers-store';
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
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const WhatsappIcon = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.472-1.761-1.645-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function CustomersManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSegment, setFilterSegment] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedCustomerForAddress, setSelectedCustomerForAddress] = useState<Customer | null>(null);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const res = await getCustomersAction();
    if (res.success && res.customers) {
      setCustomers(res.customers);
      setSelectedCustomerIds(new Set());
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: Customer['status']) => {
    // Optimistic update
    setCustomers(customers.map(c => c.id === id ? { ...c, status: newStatus } : c));
    
    // Server update
    const res = await updateCustomerStatusAction(id, newStatus);
    if (!res.success) {
      // Revert on failure
      fetchCustomers();
      alert('Failed to update status');
    }
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Customer',
      description: 'Are you sure you want to delete this customer?',
      onConfirm: async () => {
        // Optimistic update
        setCustomers(prev => prev.filter(c => c.id !== id));
        
        // Server update
        const res = await deleteCustomerAction(id);
        if (!res.success) {
          // Revert on failure
          fetchCustomers();
          alert('Failed to delete customer');
        }
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomerIds(new Set(customers.map((c) => c.id)));
    } else {
      setSelectedCustomerIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedCustomerIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedCustomerIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedCustomerIds.size === 0) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Multiple Customers',
      description: `Are you sure you want to delete ${selectedCustomerIds.size} customers?`,
      onConfirm: async () => {
        const idsToDelete = Array.from(selectedCustomerIds);
        
        // Optimistic update
        setCustomers(prev => prev.filter(c => !selectedCustomerIds.has(c.id)));
        setSelectedCustomerIds(new Set());

        // Server update
        const res = await deleteCustomersAction(idsToDelete);
        if (!res.success) {
          // Revert on failure
          fetchCustomers();
          alert('Failed to delete some customers');
        }
      }
    });
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (customer.phone && customer.phone.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterSegment === 'All Status') return matchesSearch;
    return matchesSearch && customer.status === filterSegment;
  });

  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage) || 1;
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setSelectedCustomerIds(new Set());
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-burgundy">Customers</h1>
          <p className="text-burgundy/60 font-body text-sm mt-1">Manage your customer base and view their purchase history.</p>
        </div>
        <div>
          <button 
            onClick={() => alert('Exporting customers to CSV...')}
            className="flex items-center gap-2 bg-white border border-burgundy/10 text-burgundy px-4 py-2 rounded-full font-body text-sm font-medium hover:bg-rose-gold/10 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-burgundy/5 flex flex-col sm:flex-row justify-between gap-4 bg-ivory/30">
          <div className="flex items-center gap-2 bg-white border border-burgundy/10 rounded-xl px-4 py-2 w-full sm:w-80 focus-within:border-burgundy/30 transition-colors">
            <Search size={16} className="text-burgundy/40" />
            <input aria-label="Search customers..." 
              type="text" 
              placeholder="Search customers..." 
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
              onClick={fetchCustomers}
              className="px-3 py-2 text-burgundy/60 hover:text-burgundy hover:bg-burgundy/5 rounded-full transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
              title="Refresh Customers"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            {selectedCustomerIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-full font-body text-sm font-medium hover:bg-red-100 transition-colors shadow-sm self-start sm:self-auto"
              >
                <Trash2 size={16} />
                Delete ({selectedCustomerIds.size})
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger className="bg-white border border-burgundy/10 text-burgundy text-sm rounded-full px-4 py-2 font-body outline-none focus:border-burgundy/30 transition-colors cursor-pointer flex items-center gap-2">
                {filterSegment} <ChevronDown size={16} className="text-burgundy/50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white border border-burgundy/10 rounded-xl shadow-lg p-1">
                <DropdownMenuItem 
                  onClick={() => { setFilterSegment('All Status'); setCurrentPage(1); }}
                  className="cursor-pointer text-sm text-burgundy focus:bg-rose-gold/10 hover:bg-rose-gold/10 rounded-md px-3 py-2 outline-none"
                >
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => { setFilterSegment('Active'); setCurrentPage(1); }}
                  className="cursor-pointer text-sm text-burgundy focus:bg-rose-gold/10 hover:bg-rose-gold/10 rounded-md px-3 py-2 outline-none"
                >
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => { setFilterSegment('Inactive'); setCurrentPage(1); }}
                  className="cursor-pointer text-sm text-burgundy focus:bg-rose-gold/10 hover:bg-rose-gold/10 rounded-md px-3 py-2 outline-none"
                >
                  Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CustomersTable loading={loading} paginatedCustomers={paginatedCustomers} selectedCustomerIds={selectedCustomerIds} setSelectedCustomerIds={setSelectedCustomerIds} handleSelectOne={handleSelectOne} setSelectedCustomerForAddress={setSelectedCustomerForAddress} handleDelete={handleDelete} handleStatusChange={handleStatusChange} filteredCustomers={filteredCustomers} />
        
        {/* Pagination */}
        <CustomersPagination rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} setCurrentPage={setCurrentPage} currentPage={currentPage} totalPages={totalPages} handlePageChange={handlePageChange} filteredCustomers={filteredCustomers} />
      </div>

      {/* Address Modal */}
      {selectedCustomerForAddress && <AddressModal selectedCustomerForAddress={selectedCustomerForAddress} setSelectedCustomerForAddress={setSelectedCustomerForAddress} />}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        variant="danger"
        confirmText="Delete"
      />
    </div>
  );
}
