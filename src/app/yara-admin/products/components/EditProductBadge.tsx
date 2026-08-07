import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Product } from '@/types';

interface EditProductBadgeProps {
  editingProduct: Product;
  setEditingProduct: React.Dispatch<React.SetStateAction<Product | null>>;
}

export function EditProductBadge({
  editingProduct,
  setEditingProduct,
}: EditProductBadgeProps) {
  return (
    <div>
      <span className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Badge</span>
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full flex justify-between items-center bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors cursor-pointer data-[state=open]:border-burgundy/30">
          <span>
            {editingProduct.badge === 'trending' ? 'Trending' : 
             editingProduct.badge === 'best-seller' ? 'Best Seller' : 
             editingProduct.badge === 'new' ? 'New Arrival' : 
             editingProduct.badge === 'limited' ? 'Limited Edition' : 
             'None'}
          </span>
          <ChevronDown size={16} className="opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-(--anchor-width) min-w-[200px] bg-white border border-burgundy/10 shadow-lg shadow-burgundy/5 rounded-xl p-1 z-[100]"
        >
          <DropdownMenuItem 
            onClick={() => setEditingProduct({...editingProduct, badge: undefined})}
            className="cursor-pointer px-3 py-2.5 text-sm text-burgundy/60 hover:bg-burgundy/5 rounded-lg transition-colors focus:bg-burgundy/10 focus:text-burgundy"
          >
            None
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setEditingProduct({...editingProduct, badge: 'trending'})}
            className="cursor-pointer px-3 py-2.5 text-sm font-medium text-burgundy hover:bg-burgundy/5 rounded-lg transition-colors focus:bg-burgundy/10 focus:text-burgundy"
          >
            Trending
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setEditingProduct({...editingProduct, badge: 'best-seller'})}
            className="cursor-pointer px-3 py-2.5 text-sm font-medium text-burgundy hover:bg-burgundy/5 rounded-lg transition-colors focus:bg-burgundy/10 focus:text-burgundy"
          >
            Best Seller
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setEditingProduct({...editingProduct, badge: 'new'})}
            className="cursor-pointer px-3 py-2.5 text-sm font-medium text-burgundy hover:bg-burgundy/5 rounded-lg transition-colors focus:bg-burgundy/10 focus:text-burgundy"
          >
            New Arrival
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setEditingProduct({...editingProduct, badge: 'limited'})}
            className="cursor-pointer px-3 py-2.5 text-sm font-medium text-burgundy hover:bg-burgundy/5 rounded-lg transition-colors focus:bg-burgundy/10 focus:text-burgundy"
          >
            Limited Edition
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
