import os

page_path = 'src/app/shop/page.tsx'
with open(page_path, 'r') as f:
    lines = f.readlines()

def get_lines(start_line_1_index, end_line_1_index):
    return "".join(lines[start_line_1_index-1 : end_line_1_index])

card_block = get_lines(46, 218)

card_comp = """import { useState } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { formatPrice } from '@/lib/utils';
import { BADGE_CONFIG } from '@/lib/constants';
import { Product } from '@/types';

""" + card_block

with open('src/app/shop/components/ProductCard.tsx', 'w') as f: f.write(card_comp)

lines[46-1:218] = ['\n']

import_str = """import { ProductCard } from './components/ProductCard';\n"""
for i, line in enumerate(lines):
    if line.startswith("import PageWrapper"):
        lines[i] = line + import_str
        break

with open(page_path, 'w') as f:
    f.write("".join(lines))

print("Done extracting ProductCard")
