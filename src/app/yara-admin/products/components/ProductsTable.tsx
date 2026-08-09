import React from 'react';
import { Product } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit2, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

interface ProductsTableProps {
  paginatedProducts: Product[];
  handleEdit: (product: Product) => void;
  handleDuplicate: (id: string) => void;
  toggleProductStatus: (product: Product, currentStatus: boolean) => void;
  handleDelete: (id: string) => void;
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
}

export function ProductsTable({
  paginatedProducts,
  handleEdit,
  handleDuplicate,
  toggleProductStatus,
  handleDelete,
  selectedIds,
  onSelectAll,
  onSelectOne,
}: ProductsTableProps) {
  const isAllSelected = paginatedProducts.length > 0 && selectedIds.length === paginatedProducts.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < paginatedProducts.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse table-fixed">
        {/* colgroup locks every column to the same width in header and body rows */}
        <colgroup>
          <col style={{ width: '48px' }} />
          <col style={{ width: '35%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '14%' }} />
        </colgroup>

        <thead>
          <tr className="border-b border-burgundy/10 text-burgundy/60 font-body text-xs uppercase tracking-wider">
            <th className="px-4 py-3 font-semibold">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
                className={`rounded border-burgundy/20 text-burgundy focus:ring-burgundy ${!isAllSelected && isSomeSelected ? 'bg-burgundy/20' : ''}`}
              />
            </th>
            <th className="px-4 py-3 font-semibold">Product</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Stock</th>
            <th className="px-4 py-3 font-semibold">Price</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="text-sm font-body">
          {paginatedProducts.map((product) => (
            <tr
              key={product.id}
              className="border-b border-burgundy/5 last:border-0 hover:bg-ivory/30 transition-colors"
            >
              {/* Checkbox */}
              <td className="px-4 py-3">
                <Checkbox
                  checked={selectedIds.includes(product.id)}
                  onCheckedChange={(checked) => onSelectOne(product.id, !!checked)}
                  className="rounded border-burgundy/20 text-burgundy focus:ring-burgundy"
                />
              </td>

              {/* Product name + thumbnail */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-champagne rounded-lg overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-burgundy truncate">{product.name}</p>
                    <p className="font-ui text-xs text-burgundy/50">
                      {product.productCode || `CODE-${product.id.substring(0, 8)}`}
                    </p>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="px-4 py-3 text-burgundy/80 capitalize truncate">{product.category}</td>

              {/* Stock */}
              <td className="px-4 py-3 font-ui text-burgundy/80">
                <span className={product.inStock ? 'text-emerald-600' : 'text-red-500'}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </td>

              {/* Price */}
              <td className="px-4 py-3 font-ui font-medium text-burgundy">
                {formatPrice(product.price)}
              </td>

              {/* Status badge */}
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {product.isActive ? 'Active' : 'Hidden'}
                </span>
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-burgundy/50 hover:text-burgundy hover:bg-rose-gold/10 rounded-lg transition-colors"
                    title="Edit Product"
                    aria-label="Edit Product"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-burgundy/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Product"
                    aria-label="Delete Product"
                  >
                    <Trash2 size={16} />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 text-burgundy/50 hover:text-burgundy hover:bg-rose-gold/10 rounded-lg transition-colors outline-none cursor-pointer">
                      <MoreVertical size={16} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-white border border-burgundy/10 rounded-xl shadow-lg p-1">
                      <DropdownMenuItem
                        onClick={() => handleDuplicate(product.id)}
                        className="cursor-pointer text-sm text-burgundy focus:bg-rose-gold/10 hover:bg-rose-gold/10 rounded-md px-3 py-2 outline-none"
                      >
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleProductStatus(product, !!product.isActive)}
                        className="cursor-pointer text-sm text-burgundy focus:bg-rose-gold/10 hover:bg-rose-gold/10 rounded-md px-3 py-2 outline-none"
                      >
                        {product.isActive ? 'Hide Product' : 'Set Active'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
