import os

page_path = 'src/app/yara-admin/orders/page.tsx'
with open(page_path, 'r') as f:
    lines = f.readlines()

def get_lines(start, end):
    return "".join(lines[start-1 : end])

pagination_block = get_lines(448, 523)
modal_block = get_lines(527, 689)

pagination_comp = """import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';

export function OrdersPagination({
  rowsPerPage, setRowsPerPage, setCurrentPage, currentPage, totalPages, handlePageChange, filteredOrders
}: any) {
  return (
    <>
""" + pagination_block + """
    </>
  );
}
"""

modal_comp = """import { X, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { PB_URL } from '@/lib/pocketbase';

export function ViewOrderModal({
  selectedOrder, setSelectedOrder, handleStatusChange, handlePaymentStatusChange
}: any) {
  return (
    <>
""" + modal_block + """
    </>
  );
}
"""

os.makedirs('src/app/yara-admin/orders/components', exist_ok=True)
with open('src/app/yara-admin/orders/components/OrdersPagination.tsx', 'w') as f: f.write(pagination_comp)
with open('src/app/yara-admin/orders/components/ViewOrderModal.tsx', 'w') as f: f.write(modal_comp)

# Replace in reverse order!
lines[527-1:689] = ['      {selectedOrder && <ViewOrderModal selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} handleStatusChange={handleStatusChange} handlePaymentStatusChange={handlePaymentStatusChange} />}\n']
lines[448-1:523] = ['        <OrdersPagination rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} setCurrentPage={setCurrentPage} currentPage={currentPage} totalPages={totalPages} handlePageChange={handlePageChange} filteredOrders={filteredOrders} />\n']

import_str = """import { OrdersPagination } from './components/OrdersPagination';
import { ViewOrderModal } from './components/ViewOrderModal';\n"""
for i, line in enumerate(lines):
    if line.startswith("import {"):
        lines[i] = line + import_str
        break

with open(page_path, 'w') as f:
    f.write("".join(lines))

print("Done extracting components")
