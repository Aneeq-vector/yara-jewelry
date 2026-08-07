import os

page_path = 'src/app/yara-admin/customers/page.tsx'
with open(page_path, 'r') as f:
    lines = f.readlines()

def get_lines(start, end):
    return "".join(lines[start-1 : end])

pagination_block = get_lines(222, 293)
modal_block = get_lines(297, 347)

pagination_comp = """import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function CustomersPagination({
  rowsPerPage, setRowsPerPage, setCurrentPage, currentPage, totalPages, handlePageChange, filteredCustomers
}: any) {
  return (
    <>
""" + pagination_block + """
    </>
  );
}
"""

modal_comp = """export function AddressModal({
  selectedCustomerForAddress, setSelectedCustomerForAddress
}: any) {
  return (
    <>
""" + modal_block + """
    </>
  );
}
"""

os.makedirs('src/app/yara-admin/customers/components', exist_ok=True)
with open('src/app/yara-admin/customers/components/CustomersPagination.tsx', 'w') as f: f.write(pagination_comp)
with open('src/app/yara-admin/customers/components/AddressModal.tsx', 'w') as f: f.write(modal_comp)

lines[297-1:347] = ['      {selectedCustomerForAddress && <AddressModal selectedCustomerForAddress={selectedCustomerForAddress} setSelectedCustomerForAddress={setSelectedCustomerForAddress} />}\n']
lines[222-1:293] = ['        <CustomersPagination rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} setCurrentPage={setCurrentPage} currentPage={currentPage} totalPages={totalPages} handlePageChange={handlePageChange} filteredCustomers={filteredCustomers} />\n']

import_str = """import { CustomersPagination } from './components/CustomersPagination';
import { AddressModal } from './components/AddressModal';\n"""
for i, line in enumerate(lines):
    if line.startswith("import {"):
        lines[i] = line + import_str
        break

with open(page_path, 'w') as f:
    f.write("".join(lines))

print("Done extracting components")
