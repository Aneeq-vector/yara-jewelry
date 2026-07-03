'use client';

import { useState } from 'react';
import { Search, Download, MoreVertical, Mail, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useCustomersStore, Customer } from '@/lib/store/customers-store';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function CustomersManager() {
  const { customers, deleteCustomer, updateCustomerStatus } = useCustomersStore();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const toggleMenu = (id: string) => {
    if (activeMenuId === id) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(id);
    }
  };

  const handleStatusChange = (id: string, newStatus: Customer['status']) => {
    updateCustomerStatus(id, newStatus);
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-burgundy">Customers</h1>
          <p className="text-burgundy/60 font-body text-sm mt-1">Manage your customer base and view their purchase history.</p>
        </div>
        <button 
          onClick={() => alert('Exporting customers to CSV...')}
          className="flex items-center gap-2 bg-white border border-burgundy/10 text-burgundy px-4 py-2 rounded-xl font-ui text-sm font-semibold hover:bg-rose-gold/10 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-burgundy/5 flex flex-col sm:flex-row justify-between gap-4 bg-ivory/30">
          <div className="flex items-center gap-2 bg-white border border-burgundy/10 rounded-xl px-4 py-2 w-full sm:w-80 focus-within:border-burgundy/30 transition-colors">
            <Search size={16} className="text-burgundy/40" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="bg-transparent border-none outline-none text-sm text-burgundy placeholder:text-burgundy/40 w-full font-body"
            />
          </div>
          <div className="flex items-center gap-3">
            <select className="bg-white border border-burgundy/10 text-burgundy text-sm rounded-xl px-4 py-2 font-body outline-none focus:border-burgundy/30 transition-colors cursor-pointer">
              <option>All Segments</option>
              <option>VIP</option>
              <option>Active</option>
              <option>Inactive</option>
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
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Orders</th>
                <th className="p-4 font-semibold">Total Spent</th>
                <th className="p-4 font-semibold">Joined</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-body">
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-burgundy/5 last:border-0 hover:bg-ivory/30 transition-colors">
                  <td className="p-4">
                    <Checkbox className="rounded border-burgundy/20 text-burgundy focus:ring-burgundy" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-champagne flex items-center justify-center text-burgundy font-bold text-sm">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-burgundy">{customer.name}</div>
                        <div className="text-xs text-burgundy/50">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      customer.status === 'VIP' ? 'bg-purple-100 text-purple-700' :
                      customer.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="p-4 font-ui text-burgundy/80">{customer.orders}</td>
                  <td className="p-4 font-ui font-bold text-burgundy">
                    {customer.spent}
                  </td>
                  <td className="p-4 font-ui text-burgundy/80">
                    {customer.joined}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 relative">
                      <button 
                        onClick={() => window.location.href = `mailto:${customer.email}`}
                        className="p-2 text-burgundy/50 hover:text-burgundy hover:bg-rose-gold/10 rounded-lg transition-colors" 
                        title="Send Email"
                      >
                        <Mail size={16} />
                      </button>
                      <button 
                        onClick={() => deleteCustomer(customer.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => toggleMenu(customer.id)}
                        className={`p-2 rounded-lg transition-colors ${activeMenuId === customer.id ? 'bg-rose-gold/10 text-burgundy' : 'text-burgundy/50 hover:text-burgundy hover:bg-rose-gold/10'}`}
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {activeMenuId === customer.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-burgundy/10 rounded-xl shadow-lg z-10 py-1 overflow-hidden">
                          <button onClick={() => handleStatusChange(customer.id, 'VIP')} className="w-full text-left px-4 py-2 text-sm text-burgundy hover:bg-rose-gold/10 transition-colors">Make VIP</button>
                          <button onClick={() => handleStatusChange(customer.id, 'Active')} className="w-full text-left px-4 py-2 text-sm text-burgundy hover:bg-rose-gold/10 transition-colors">Set Active</button>
                          <button onClick={() => handleStatusChange(customer.id, 'Inactive')} className="w-full text-left px-4 py-2 text-sm text-burgundy hover:bg-rose-gold/10 transition-colors">Set Inactive</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && (
            <div className="p-8 text-center text-burgundy/50 font-body">
              No customers found.
            </div>
          )}
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
            <span className="ml-4">1-{customers.length} of {customers.length}</span>
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
    </div>
  );
}
