import os

page_path = 'src/app/shop/[id]/page.tsx'
with open(page_path, 'r') as f:
    lines = f.readlines()

def get_lines(start_line_1_index, end_line_1_index):
    return "".join(lines[start_line_1_index-1 : end_line_1_index])

size_guide_block = get_lines(557, 669)
related_block = get_lines(518, 552)

size_guide_comp = """import { m as motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function SizeGuideModal({ isSizeGuideOpen, setIsSizeGuideOpen }: any) {
  return (
""" + size_guide_block + """
  );
}
"""

related_comp = """import { m as motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';

export function RelatedProducts({ relatedProducts }: { relatedProducts: Product[] }) {
  return (
""" + related_block + """
  );
}
"""

os.makedirs('src/app/shop/[id]/components', exist_ok=True)
with open('src/app/shop/[id]/components/SizeGuideModal.tsx', 'w') as f: f.write(size_guide_comp)
with open('src/app/shop/[id]/components/RelatedProducts.tsx', 'w') as f: f.write(related_comp)

lines[557-1:669] = ['      <SizeGuideModal isSizeGuideOpen={isSizeGuideOpen} setIsSizeGuideOpen={setIsSizeGuideOpen} />\n']
lines[518-1:552] = ['          <RelatedProducts relatedProducts={relatedProducts} />\n']

import_str = """import { SizeGuideModal } from './components/SizeGuideModal';
import { RelatedProducts } from './components/RelatedProducts';
"""
for i, line in enumerate(lines):
    if line.startswith("import PageWrapper"):
        lines[i] = line + import_str
        break

with open(page_path, 'w') as f:
    f.write("".join(lines))

print("Done extracting SizeGuide and RelatedProducts")
