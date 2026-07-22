'use client';

import { useState, useEffect } from 'react';
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

export default function CustomersManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSegment, setFilterSegment] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedCustomerForAddress, setSelectedCustomerForAddress] = useState<Customer | null>(null);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    // Optimistic update
    setCustomers(customers.filter(c => c.id !== id));
    
    // Server update
    const res = await deleteCustomerAction(id);
    if (!res.success) {
      // Revert on failure
      fetchCustomers();
      alert('Failed to delete customer');
    }
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

  const handleBulkDelete = async () => {
    if (selectedCustomerIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedCustomerIds.size} customers?`)) return;

    const idsToDelete = Array.from(selectedCustomerIds);
    
    // Optimistic update
    setCustomers(customers.filter(c => !idsToDelete.includes(c.id)));
    setSelectedCustomerIds(new Set());

    // Server update
    const res = await deleteCustomersAction(idsToDelete);
    if (!res.success) {
      // Revert on failure
      fetchCustomers();
      alert('Failed to delete some customers');
    }
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
            <input 
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

        {/* Table */}
        <div className="overflow-x-auto relative min-h-[300px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
              <div className="w-8 h-8 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin"></div>
            </div>
          ) : null}
          <table className="w-full text-center border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-burgundy/10 text-burgundy/60 font-body text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold w-12 text-center">
                  <Checkbox 
                    className="rounded border-burgundy/20 text-burgundy focus:ring-burgundy mx-auto block" 
                    checked={paginatedCustomers.length > 0 && selectedCustomerIds.size === paginatedCustomers.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCustomerIds(new Set(paginatedCustomers.map(c => c.id)));
                      } else {
                        setSelectedCustomerIds(new Set());
                      }
                    }}
                  />
                </th>
                <th className="p-4 font-semibold text-center pr-24">Customer</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">Orders</th>
                <th className="p-4 font-semibold text-center">Total Spent</th>
                <th className="p-4 font-semibold text-center">Joined</th>
                <th className="p-4 font-semibold text-center">Address</th>
                <th className="p-4 font-semibold text-center pl-16">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-body">
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-burgundy/5 last:border-0 hover:bg-ivory/30 transition-colors">
                  <td className="p-4 text-center">
                    <Checkbox 
                      className="rounded border-burgundy/20 text-burgundy focus:ring-burgundy mx-auto block"
                      checked={selectedCustomerIds.has(customer.id)}
                      onCheckedChange={(checked) => handleSelectOne(customer.id, checked as boolean)}
                    />
                  </td>
                  <td className="p-4 text-left">
                    <div className="flex items-center justify-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-champagne flex items-center justify-center text-burgundy font-bold text-sm uppercase shrink-0">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-burgundy">{customer.name}</div>
                        <div className="text-xs text-burgundy/50">{customer.email}</div>
                        {customer.phone && <div className="text-xs text-burgundy/40">{customer.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      customer.status === 'VIP' ? 'bg-purple-100 text-purple-700' :
                      customer.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="p-4 font-ui text-burgundy/80 text-center">{customer.orders}</td>
                  <td className="p-4 font-ui font-bold text-burgundy text-center">
                    {customer.spent}
                  </td>
                  <td className="p-4 font-ui text-burgundy/80 text-center">
                    {customer.joined}
                  </td>
                  <td className="p-4 text-center">
                    {customer.addresses && customer.addresses.length > 0 ? (
                      <button
                        onClick={() => setSelectedCustomerForAddress(customer)}
                        className="text-burgundy/70 hover:text-burgundy bg-burgundy/5 hover:bg-burgundy/10 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                      >
                        View ({customer.addresses.length})
                      </button>
                    ) : (
                      <span className="text-burgundy/40 text-xs italic">N/A</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 relative">
                      <button 
                        onClick={() => {
                          if (customer.phone) {
                            let cleanPhone = customer.phone.replace(/[^0-9]/g, '');
                            // If it starts with 0 (local format), replace with country code 94
                            if (cleanPhone.startsWith('0')) {
                              cleanPhone = '94' + cleanPhone.substring(1);
                            } else if (cleanPhone.length === 9) {
                              // If it's 9 digits (missing 0 and 94), prepend 94
                              cleanPhone = '94' + cleanPhone;
                            }
                            window.open(`https://wa.me/${cleanPhone}`, '_blank');
                          } else {
                            alert('No phone number provided for this customer.');
                          }
                        }}
                        className={`p-2 rounded-lg transition-colors ${customer.phone ? 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50' : 'text-emerald-500/30 cursor-not-allowed'}`}
                        title="Open WhatsApp"
                      >
                        <WhatsappIcon size={16} />
                      </button>
                      <button 
                        onClick={() => window.location.href = `mailto:${customer.email}`}
                        className="p-2 text-burgundy/50 hover:text-burgundy hover:bg-rose-gold/10 rounded-lg transition-colors" 
                        title="Send Email"
                      >
                        <Mail size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(customer.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 text-burgundy/50 hover:text-burgundy hover:bg-rose-gold/10 rounded-lg transition-colors outline-none cursor-pointer">
                          <MoreVertical size={16} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32 bg-white border border-burgundy/10 shadow-lg rounded-xl p-1">
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(customer.id, 'Active')}
                            className="cursor-pointer text-sm text-burgundy hover:bg-rose-gold/10 focus:bg-rose-gold/10 rounded-md px-3 py-2 outline-none"
                          >
                            Set Active
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(customer.id, 'Inactive')}
                            className="cursor-pointer text-sm text-burgundy hover:bg-rose-gold/10 focus:bg-rose-gold/10 rounded-md px-3 py-2 outline-none"
                          >
                            Set Inactive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredCustomers.length === 0 && (
            <div className="p-8 text-center text-burgundy/50 font-body">
              No customers found matching your criteria.
            </div>
          )}
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-burgundy/5 bg-ivory/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-burgundy/60 font-body">
            <span>Rows per page:</span>
            <select 
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent border border-burgundy/10 rounded-md px-2 py-1 outline-none focus:border-burgundy/30 cursor-pointer text-burgundy"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="ml-4">
              {filteredCustomers.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-
              {Math.min(currentPage * rowsPerPage, filteredCustomers.length)} of {filteredCustomers.length}
            </span>
          </div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                if (
                  p === 1 || 
                  p === totalPages || 
                  (p >= currentPage - 1 && p <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === p}
                        onClick={(e) => { e.preventDefault(); handlePageChange(p); }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  p === currentPage - 2 || 
                  p === currentPage + 2
                ) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Address Modal */}
      {selectedCustomerForAddress && (
        <div 
          className="fixed inset-0 bg-burgundy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCustomerForAddress(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl border border-burgundy/10 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading font-bold text-burgundy">
                Addresses for {selectedCustomerForAddress.name}
              </h2>
              <button 
                onClick={() => setSelectedCustomerForAddress(null)}
                className="text-burgundy/50 hover:text-burgundy p-2 rounded-full hover:bg-burgundy/5 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {selectedCustomerForAddress.addresses && selectedCustomerForAddress.addresses.length > 0 ? (
              <div className="space-y-4">
                {selectedCustomerForAddress.addresses.map((address: any) => (
                  <div key={address.id} className="border border-burgundy/10 rounded-2xl p-4 bg-ivory/20 relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-burgundy">{address.name}</span>
                      {address.isDefault && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-burgundy/70 space-y-1">
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} {address.zipCode}</p>
                      {address.phone && (
                        <p className="pt-1 flex items-center gap-2">
                          <span className="text-burgundy/40 text-xs">📞</span> {address.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-burgundy/50 text-center py-8 font-body">No addresses found for this customer.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
