import os

page_path = 'src/app/yara-admin/orders/page.tsx'
with open(page_path, 'r') as f:
    lines = f.readlines()

def get_lines(start, end):
    return "".join(lines[start-1 : end])

table_block = get_lines(314, 447)

table_comp = """import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown, Eye, FileText } from 'lucide-react';
import { PB_URL } from '@/lib/pocketbase';

export function OrdersTable({
  paginatedOrders, isAllSelected, handleSelectAll, selectedOrders, handleSelectOrder,
  handleStatusChange, handlePaymentStatusChange, setSelectedOrder
}: any) {
  return (
    <>
""" + table_block + """
    </>
  );
}
"""

os.makedirs('src/app/yara-admin/orders/components', exist_ok=True)
with open('src/app/yara-admin/orders/components/OrdersTable.tsx', 'w') as f: f.write(table_comp)

lines[314-1:447] = ['        <OrdersTable paginatedOrders={paginatedOrders} isAllSelected={isAllSelected} handleSelectAll={handleSelectAll} selectedOrders={selectedOrders} handleSelectOrder={handleSelectOrder} handleStatusChange={handleStatusChange} handlePaymentStatusChange={handlePaymentStatusChange} setSelectedOrder={setSelectedOrder} />\n']

import_str = """import { OrdersTable } from './components/OrdersTable';\n"""
for i, line in enumerate(lines):
    if line.startswith("import {"):
        lines[i] = line + import_str
        break

with open(page_path, 'w') as f:
    f.write("".join(lines))

print("Done extracting components")
