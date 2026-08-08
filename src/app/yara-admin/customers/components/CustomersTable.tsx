import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreVertical, Mail, Trash2 } from 'lucide-react';
import { Customer } from '@/lib/store/customers-store';
import { TableSkeleton } from '@/components/admin/TableSkeleton';

const WhatsappIcon = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.472-1.761-1.645-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export function CustomersTable({
  loading, paginatedCustomers, selectedCustomerIds, setSelectedCustomerIds,
  handleSelectOne, setSelectedCustomerForAddress, handleDelete, handleStatusChange,
  filteredCustomers
}: any) {
  if (loading) {
    return <TableSkeleton columns={7} rows={8} />;
  }

  return (
    <>
        {/* Table */}
        <div className="overflow-x-auto relative min-h-[300px]">
          <table className="w-full text-center border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-burgundy/10 text-burgundy/60 font-body text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold w-12 text-center">
                  <Checkbox 
                    className="rounded border-burgundy/20 text-burgundy focus:ring-burgundy mx-auto block" 
                    checked={paginatedCustomers.length > 0 && selectedCustomerIds.size === paginatedCustomers.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCustomerIds(new Set(paginatedCustomers.map((c: any) => c.id)));
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
              {paginatedCustomers.map((customer: any) => (
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

    </>
  );
}
