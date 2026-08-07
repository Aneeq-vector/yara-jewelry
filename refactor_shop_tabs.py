import os

page_path = 'src/app/shop/[id]/page.tsx'
with open(page_path, 'r') as f:
    lines = f.readlines()

def get_lines(start_line_1_index, end_line_1_index):
    return "".join(lines[start_line_1_index-1 : end_line_1_index])

tabs_block = get_lines(429, 514)

tabs_comp = """import { Check, Star } from 'lucide-react';
import { Product } from '@/types';

export function ProductTabs({ product, activeTab, setActiveTab }: { product: Product, activeTab: string, setActiveTab: (tab: 'description' | 'details' | 'reviews') => void }) {
  return (
""" + tabs_block + """
  );
}
"""

with open('src/app/shop/[id]/components/ProductTabs.tsx', 'w') as f: f.write(tabs_comp)

lines[429-1:514] = ['              <ProductTabs product={product} activeTab={activeTab} setActiveTab={setActiveTab} />\n']

import_str = """import { ProductTabs } from './components/ProductTabs';\n"""
for i, line in enumerate(lines):
    if line.startswith("import PageWrapper"):
        lines[i] = line + import_str
        break

with open(page_path, 'w') as f:
    f.write("".join(lines))

print("Done extracting ProductTabs")
