'use client';

import { useState } from 'react';
import { Search, Filter, Plus, MoreVertical, Edit2, Trash2, X, Save } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { products as initialProducts, Product } from '@/lib/data/products';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProductsManager() {
  const [productList, setProductList] = useState(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProductList(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleMore = (id: string) => {
    alert(`More options for product ID: ${id}`);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-burgundy">Products</h1>
          <p className="text-burgundy/60 font-body text-sm mt-1">Manage your jewelry inventory, pricing, and details.</p>
        </div>
        <button 
          onClick={() => alert('Add Product feature coming soon!')}
          className="flex items-center gap-2 bg-burgundy text-white px-4 py-2 rounded-xl font-ui text-sm font-semibold hover:bg-wine transition-colors shadow-md shadow-burgundy/20 self-start sm:self-auto"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-burgundy/5 flex flex-col sm:flex-row justify-between gap-4 bg-ivory/30">
          <div className="flex items-center gap-2 bg-white border border-burgundy/10 rounded-xl px-4 py-2 w-full sm:w-80 focus-within:border-burgundy/30 transition-colors">
            <Search size={16} className="text-burgundy/40" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="bg-transparent border-none outline-none text-sm text-burgundy placeholder:text-burgundy/40 w-full font-body"
            />
          </div>
          <div className="flex items-center gap-3">
            <select className="bg-white border border-burgundy/10 text-burgundy text-sm rounded-xl px-4 py-2 font-body outline-none focus:border-burgundy/30 transition-colors cursor-pointer">
              <option>All Categories</option>
              <option>Rings</option>
              <option>Necklaces</option>
              <option>Earrings</option>
            </select>
            <select className="bg-white border border-burgundy/10 text-burgundy text-sm rounded-xl px-4 py-2 font-body outline-none focus:border-burgundy/30 transition-colors cursor-pointer">
              <option>Sort by: Newest</option>
              <option>Price: High to Low</option>
              <option>Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-burgundy/10 text-burgundy/60 font-body text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold w-12">
                  <Checkbox className="rounded border-burgundy/20 text-burgundy focus:ring-burgundy" />
                </th>
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-body">
              {productList.map((product) => (
                <tr key={product.id} className="border-b border-burgundy/5 last:border-0 hover:bg-ivory/30 transition-colors">
                  <td className="p-4">
                    <Checkbox className="rounded border-burgundy/20 text-burgundy focus:ring-burgundy" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-champagne rounded-lg overflow-hidden flex-shrink-0 relative">
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-burgundy">{product.name}</p>
                        <p className="font-ui text-xs text-burgundy/50">{product.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-burgundy/80 capitalize">{product.category}</td>
                  <td className="p-4 font-ui text-burgundy/80">
                    42 in stock
                  </td>
                  <td className="p-4 font-ui font-medium text-burgundy">
                    {formatPrice(product.price)}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      Active
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 text-burgundy/50 hover:text-burgundy hover:bg-rose-gold/10 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger 
                          className="p-2 text-burgundy/50 hover:text-burgundy hover:bg-rose-gold/10 rounded-lg transition-colors"
                          title="More Options"
                        >
                          <MoreVertical size={16} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="font-body w-40">
                          <DropdownMenuItem onClick={() => handleEdit(product)}>Edit Details</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>Hide from Store</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500 focus:text-red-600" onClick={() => handleDelete(product.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-burgundy/5 bg-ivory/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-burgundy/60 font-body">
            <span>Rows per page:</span>
            <select defaultValue="25" className="bg-transparent border border-burgundy/10 rounded-md px-2 py-1 outline-none focus:border-burgundy/30 cursor-pointer text-burgundy">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="ml-4">1-25 of 124</span>
          </div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-burgundy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-burgundy/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading font-bold text-xl text-burgundy">Edit Product</h2>
              <button onClick={() => setEditingProduct(null)} className="text-burgundy/50 hover:text-burgundy p-2 rounded-full hover:bg-champagne/50 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Product Name</label>
                <input 
                  type="text" 
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Price (Rs.)</label>
                  <input 
                    type="number" 
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Category</label>
                  <select 
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="rings">Rings</option>
                    <option value="necklaces">Necklaces</option>
                    <option value="earrings">Earrings</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-burgundy/5 mt-6">
                <button 
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 font-ui font-semibold text-burgundy/70 hover:text-burgundy transition-colors rounded-xl hover:bg-burgundy/5"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setProductList(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
                    setEditingProduct(null);
                  }}
                  className="flex items-center gap-2 bg-burgundy text-white px-5 py-2 rounded-xl font-ui text-sm font-semibold hover:bg-wine transition-colors shadow-md shadow-burgundy/20"
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
