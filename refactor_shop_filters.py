import os

page_path = 'src/app/shop/page.tsx'
with open(page_path, 'r') as f:
    lines = f.readlines()

def get_lines(start, end):
    return "".join(lines[start-1 : end])

toolbar_block = get_lines(180, 252)
sidebar_block = get_lines(256, 319)
mobile_block = get_lines(321, 389)

toolbar_comp = """import { m as motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';

export function ShopToolbar({ 
  search, setSearch, showFilters, setShowFilters, 
  isSortOpen, setIsSortOpen, sortBy, setSortBy, sortOptions 
}: any) {
  return (
    <>
""" + toolbar_block + """
    </>
  );
}
"""

sidebar_comp = """import { m as motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Category, Product } from '@/types';

export function ShopSidebarFilters({ 
  categories, products, selectedCategory, handleCategoryChange, 
  priceRanges, priceRange, setPriceRange 
}: any) {
  return (
    <>
""" + sidebar_block + """
    </>
  );
}
"""

mobile_comp = """import { m as motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category } from '@/types';

export function ShopMobileFilters({ 
  showFilters, setShowFilters, categories, selectedCategory, handleCategoryChange, 
  priceRanges, priceRange, setPriceRange 
}: any) {
  return (
    <>
""" + mobile_block + """
    </>
  );
}
"""

with open('src/app/shop/components/ShopToolbar.tsx', 'w') as f: f.write(toolbar_comp)
with open('src/app/shop/components/ShopSidebarFilters.tsx', 'w') as f: f.write(sidebar_comp)
with open('src/app/shop/components/ShopMobileFilters.tsx', 'w') as f: f.write(mobile_comp)

# Replace in reverse order so line numbers don't shift!
lines[321-1:389] = ['              <ShopMobileFilters showFilters={showFilters} setShowFilters={setShowFilters} categories={categories} selectedCategory={selectedCategory} handleCategoryChange={handleCategoryChange} priceRanges={priceRanges} priceRange={priceRange} setPriceRange={setPriceRange} />\n']
lines[256-1:319] = ['            <ShopSidebarFilters categories={categories} products={products} selectedCategory={selectedCategory} handleCategoryChange={handleCategoryChange} priceRanges={priceRanges} priceRange={priceRange} setPriceRange={setPriceRange} />\n']
lines[180-1:252] = ['          <ShopToolbar search={search} setSearch={setSearch} showFilters={showFilters} setShowFilters={setShowFilters} isSortOpen={isSortOpen} setIsSortOpen={setIsSortOpen} sortBy={sortBy} setSortBy={setSortBy} sortOptions={sortOptions} />\n']

import_str = """import { ShopToolbar } from './components/ShopToolbar';
import { ShopSidebarFilters } from './components/ShopSidebarFilters';
import { ShopMobileFilters } from './components/ShopMobileFilters';\n"""
for i, line in enumerate(lines):
    if line.startswith("import PageWrapper"):
        lines[i] = line + import_str
        break

with open(page_path, 'w') as f:
    f.write("".join(lines))

print("Done extracting components")
