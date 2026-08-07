import React from 'react';
import { Search, RefreshCw, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface ProductsToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  sortOption: string;
  setSortOption: (sort: string) => void;
  setCurrentPage: (page: number) => void;
  isLoading: boolean;
  fetchProducts: () => void;
}

export function ProductsToolbar({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  sortOption,
  setSortOption,
  setCurrentPage,
  isLoading,
  fetchProducts,
}: ProductsToolbarProps) {
  return (
    <div className="p-4 border-b border-burgundy/5 flex flex-col sm:flex-row justify-between gap-4 bg-ivory/30">
      <div className="flex items-center gap-2 bg-white border border-burgundy/10 rounded-xl px-4 py-2 w-full sm:w-80 focus-within:border-burgundy/30 transition-colors">
        <Search size={16} className="text-burgundy/40" />
        <input 
          aria-label="Search products"
          type="text" 
          placeholder="Search products..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-burgundy placeholder:text-burgundy/40 w-full font-body"
        />
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={fetchProducts}
          className="px-3 py-2 text-burgundy/60 hover:text-burgundy hover:bg-burgundy/5 rounded-full transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
          title="Refresh Products"
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="bg-white border border-burgundy/10 text-burgundy text-sm rounded-xl px-4 py-2 font-body outline-none focus:border-burgundy/30 transition-colors cursor-pointer flex items-center gap-2">
            {categoryFilter} <ChevronDown size={16} className="text-burgundy/50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white border border-burgundy/10 rounded-xl shadow-lg p-1">
            {['All Categories', 'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Nosepins', 'New Arrivals'].map((cat) => (
              <DropdownMenuItem 
                key={cat}
                onClick={() => { setCategoryFilter(cat); setCurrentPage(1); }}
                className="cursor-pointer text-sm text-burgundy focus:bg-rose-gold/10 hover:bg-rose-gold/10 rounded-md px-3 py-2 outline-none"
              >
                {cat}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger className="bg-white border border-burgundy/10 text-burgundy text-sm rounded-xl px-4 py-2 font-body outline-none focus:border-burgundy/30 transition-colors cursor-pointer flex items-center gap-2">
            {sortOption} <ChevronDown size={16} className="text-burgundy/50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white border border-burgundy/10 rounded-xl shadow-lg p-1">
            {['Sort by: Newest', 'Price: High to Low', 'Price: Low to High'].map((sort) => (
              <DropdownMenuItem 
                key={sort}
                onClick={() => { setSortOption(sort); setCurrentPage(1); }}
                className="cursor-pointer text-sm text-burgundy focus:bg-rose-gold/10 hover:bg-rose-gold/10 rounded-md px-3 py-2 outline-none"
              >
                {sort}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
