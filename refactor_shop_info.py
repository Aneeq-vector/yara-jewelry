import os

page_path = 'src/app/shop/[id]/page.tsx'
with open(page_path, 'r') as f:
    lines = f.readlines()

def get_lines(start_line_1_index, end_line_1_index):
    return "".join(lines[start_line_1_index-1 : end_line_1_index])

info_block = get_lines(242, 428)

info_comp = """import { m as motion } from 'framer-motion';
import { Star, Ruler, ShoppingBag, Loader2, Heart, Share2, Truck, RotateCcw, Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { Product } from '@/types';
import { BRAND } from '@/lib/constants';

export function ProductInfo({ 
  product, selectedColor, setSelectedColor, quantity, setQuantity, 
  handleAddToCart, isAdding, toggleItem, wishlisted, setIsSizeGuideOpen 
}: any) {
  return (
    <>
""" + info_block + """
    </>
  );
}
"""

with open('src/app/shop/[id]/components/ProductInfo.tsx', 'w') as f: f.write(info_comp)

lines[242-1:428] = ['              <ProductInfo product={product} selectedColor={selectedColor} setSelectedColor={setSelectedColor} quantity={quantity} setQuantity={setQuantity} handleAddToCart={handleAddToCart} isAdding={isAdding} toggleItem={toggleItem} wishlisted={wishlisted} setIsSizeGuideOpen={setIsSizeGuideOpen} />\n']

import_str = """import { ProductInfo } from './components/ProductInfo';\n"""
for i, line in enumerate(lines):
    if line.startswith("import PageWrapper"):
        lines[i] = line + import_str
        break

with open(page_path, 'w') as f:
    f.write("".join(lines))

print("Done extracting ProductInfo")
