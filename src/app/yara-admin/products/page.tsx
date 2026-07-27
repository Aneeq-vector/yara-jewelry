'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Plus, MoreVertical, Edit2, Trash2, X, Save, ChevronDown, RefreshCw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { getAllProducts } from '@/lib/data/products';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/pocketbase';
import { updateProductDetailsAction, updateProductWithFilesAction, deleteProductAction, duplicateProductAction } from '@/app/actions/products';
import { Upload } from 'lucide-react';
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
  const [productList, setProductList] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortOption, setSortOption] = useState('Sort by: Newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, sortOption, rowsPerPage]);

  const fetchProducts = () => {
    setIsLoading(true);
    getAllProducts().then(setProductList);
    createClient().collection('categories').getFullList({ sort: 'name' })
      .then(records => setCategories(records.map(r => ({ id: r.id, name: r.name }))))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const res = await deleteProductAction(id);
      if (res.error) {
        alert(res.error);
        return;
      }
      setProductList(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleDuplicate = async (id: string) => {
    if (window.confirm('Are you sure you want to duplicate this product?')) {
      const res = await duplicateProductAction(id);
      if (res.error) {
        alert(res.error);
        return;
      }
      getAllProducts().then(setProductList);
    }
  };

  const handleToggleVisibility = async (product: Product) => {
    const newState = !product.isActive;
    const res = await updateProductDetailsAction(product.id, { is_active: newState });
    if (res.error) {
      alert(res.error);
      return;
    }
    setProductList(prev => prev.map(p => p.id === product.id ? { ...p, isActive: newState } : p));
  };

  const handleEdit = (product: Product) => {
    const cleanDescription = product.description.replace(/^<p>/, '').replace(/<\/p>$/, '');
    setEditingProduct({ ...product, description: cleanDescription, colors: product.colors || [], tags: product.tags || [] });
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setImagesToDelete([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setNewImageFiles(prev => [...prev, ...filesArray]);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imgUrl: string, index: number) => {
    const filename = imgUrl.split('/').pop();
    if (filename && filename !== 'placeholder.png') {
      setImagesToDelete(prev => [...prev, filename]);
    }
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        images: editingProduct.images.filter((_, i) => i !== index)
      });
    }
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    setIsSaving(true);
    try {
      const categoryId = categories.find(c => c.name === editingProduct.category)?.id || editingProduct.category;
      
      const submitData = new FormData();
      submitData.append('name', editingProduct.name);
      if (editingProduct.price !== undefined) submitData.append('price', editingProduct.price.toString());
      if (editingProduct.originalPrice !== undefined) submitData.append('originalPrice', editingProduct.originalPrice.toString());
      if (categoryId) submitData.append('category', categoryId);
      if (editingProduct.inStock !== undefined) submitData.append('inStock', editingProduct.inStock.toString());
      if (editingProduct.badge) submitData.append('badge', editingProduct.badge);
      if (editingProduct.shortDescription) submitData.append('shortDescription', editingProduct.shortDescription);
      
      const desc = editingProduct.description.startsWith('<p>') ? editingProduct.description : `<p>${editingProduct.description}</p>`;
      submitData.append('description', desc);
      
      if (editingProduct.material) submitData.append('material', editingProduct.material);
      if (editingProduct.weight) submitData.append('weight', editingProduct.weight);
      if (editingProduct.rating !== undefined) submitData.append('rating', editingProduct.rating.toString());
      if (editingProduct.reviewCount !== undefined) submitData.append('reviewCount', editingProduct.reviewCount.toString());
      
      if (editingProduct.colors && editingProduct.colors.length > 0) {
        editingProduct.colors.forEach(c => submitData.append('colors', c));
      }
      
      if (editingProduct.tags && editingProduct.tags.length > 0) {
        editingProduct.tags.forEach(t => submitData.append('tags', t));
      }
      
      newImageFiles.forEach(file => {
        submitData.append('images', file);
      });
      
      if (imagesToDelete.length > 0) {
        imagesToDelete.forEach(filename => {
          submitData.append('images.-', filename);
        });
      }

      const res = await updateProductWithFilesAction(editingProduct.id, submitData);
      if (res.error) {
        throw new Error(res.error);
      }
      setProductList(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
      setEditingProduct(null);
    } catch (err: any) {
      console.error('Failed to update product', err);
      alert(`Failed to update product: ${err.message || err.toString()}\n${JSON.stringify(err.response?.data || {})}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter and sort products
  const filteredProducts = productList
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All Categories' || 
                              (product.category && product.category.toLowerCase() === categoryFilter.toLowerCase());
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOption === 'Price: High to Low') return b.price - a.price;
      if (sortOption === 'Price: Low to High') return a.price - b.price;
      // "Sort by: Newest" - Default order from PocketBase
      return 0; 
    });

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-burgundy">Products</h1>
          <p className="text-burgundy/60 font-body text-sm mt-1">Manage your jewelry inventory, pricing, and details.</p>
        </div>
        <Link 
          href="/yara-admin/products/new"
          className="flex items-center gap-2 bg-burgundy text-white px-4 py-2 rounded-xl font-ui text-sm font-semibold hover:bg-wine transition-colors shadow-md shadow-burgundy/20 self-start sm:self-auto"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-burgundy/5 flex flex-col sm:flex-row justify-between gap-4 bg-ivory/30">
          <div className="flex items-center gap-2 bg-white border border-burgundy/10 rounded-xl px-4 py-2 w-full sm:w-80 focus-within:border-burgundy/30 transition-colors">
            <Search size={16} className="text-burgundy/40" />
            <input 
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
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="border-b border-burgundy/5 last:border-0 hover:bg-ivory/30 transition-colors">
                  <td className="p-4">
                    <Checkbox className="rounded border-burgundy/20 text-burgundy focus:ring-burgundy" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-champagne rounded-lg overflow-hidden flex-shrink-0 relative">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-burgundy">{product.name}</p>
                        <p className="font-ui text-xs text-burgundy/50">{product.productCode || `CODE-${product.id.substring(0, 8)}`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-burgundy/80 capitalize">{product.category}</td>
                  <td className="p-4 font-ui text-burgundy/80">
                    <span className={product.inStock ? 'text-emerald-600' : 'text-red-500'}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-4 font-ui font-medium text-burgundy">
                    {formatPrice(product.price)}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                      {product.isActive ? 'Active' : 'Hidden'}
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
                          <DropdownMenuItem onClick={() => handleDuplicate(product.id)}>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleVisibility(product)}>
                            {product.isActive ? 'Hide from Store' : 'Show in Store'}
                          </DropdownMenuItem>
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
            <select 
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="bg-transparent border border-burgundy/10 rounded-md px-2 py-1 outline-none focus:border-burgundy/30 cursor-pointer text-burgundy"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="ml-4">{totalItems > 0 ? startIndex + 1 : 0}-{endIndex} of {totalItems}</span>
          </div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink 
                      href="#" 
                      isActive={currentPage === pageNum}
                      onClick={(e) => { e.preventDefault(); setCurrentPage(pageNum); }}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-burgundy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-xl border border-burgundy/10 flex flex-col max-h-[90vh]">
            <div className="p-6 flex justify-between items-center border-b border-burgundy/10 shrink-0">
              <h2 className="font-heading font-bold text-xl text-burgundy">Edit Product: {editingProduct.productCode}</h2>
              <button onClick={() => setEditingProduct(null)} className="text-burgundy/50 hover:text-burgundy p-2 rounded-full hover:bg-champagne/50 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Product Name</label>
                  <input 
                    type="text" 
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Category</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full flex justify-between items-center bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors cursor-pointer data-[state=open]:border-burgundy/30">
                      <span>{editingProduct.category || 'Select Category'}</span>
                      <ChevronDown size={16} className="opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      className="w-(--anchor-width) min-w-[200px] bg-white border border-burgundy/10 shadow-lg shadow-burgundy/5 rounded-xl p-1 z-[100]"
                    >
                      <DropdownMenuItem 
                        onClick={() => setEditingProduct({...editingProduct, category: '' as any})}
                        className="cursor-pointer px-3 py-2.5 text-sm text-burgundy/60 hover:bg-burgundy/5 rounded-lg transition-colors focus:bg-burgundy/10 focus:text-burgundy"
                      >
                        Select Category
                      </DropdownMenuItem>
                      {categories.map(c => (
                        <DropdownMenuItem 
                          key={c.id} 
                          onClick={() => setEditingProduct({...editingProduct, category: c.name as any})}
                          className="cursor-pointer px-3 py-2.5 text-sm font-medium text-burgundy hover:bg-burgundy/5 rounded-lg transition-colors focus:bg-burgundy/10 focus:text-burgundy"
                        >
                          {c.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Price (Rs.)</label>
                  <input 
                    type="number" 
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Original Price (Rs.)</label>
                  <input 
                    type="number" 
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, originalPrice: e.target.value ? Number(e.target.value) : undefined})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Short Description</label>
                  <textarea 
                    value={editingProduct.shortDescription || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, shortDescription: e.target.value})}
                    rows={2}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Full Description</label>
                  <textarea 
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    rows={4}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Material</label>
                  <input 
                    type="text" 
                    value={editingProduct.material || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, material: e.target.value})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Weight</label>
                  <input 
                    type="text" 
                    value={editingProduct.weight || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, weight: e.target.value})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-burgundy">Colors</label>
                  <div className="flex flex-wrap gap-2">
                    {["Gold", "Silver", "Rose Gold", "Platinum", "Black"].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          const currentColors = editingProduct.colors || [];
                          setEditingProduct(prev => prev ? ({
                            ...prev,
                            colors: currentColors.includes(color) 
                              ? currentColors.filter(c => c !== color)
                              : [...currentColors, color]
                          }) : null);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${(editingProduct.colors || []).includes(color) ? 'bg-burgundy text-white border-burgundy' : 'bg-ivory/30 text-burgundy/70 border-burgundy/20 hover:border-burgundy/50 hover:bg-ivory'}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-burgundy">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {["necklace", "gold", "minimalist", "earrings", "rings", "bracelets", "silver", "diamonds", "pearls", "bestseller", "new", "sale", "trendy", "classic", "bridal"].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const currentTags = editingProduct.tags || [];
                          setEditingProduct(prev => prev ? ({
                            ...prev,
                            tags: currentTags.includes(tag) 
                              ? currentTags.filter(t => t !== tag)
                              : [...currentTags, tag]
                          }) : null);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${(editingProduct.tags || []).includes(tag) ? 'bg-burgundy text-white border-burgundy' : 'bg-ivory/30 text-burgundy/70 border-burgundy/20 hover:border-burgundy/50 hover:bg-ivory'}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Rating (1-5)</label>
                  <input 
                    type="number" 
                    min="1"
                    max="5"
                    step="1"
                    value={editingProduct.rating || 1}
                    onChange={(e) => setEditingProduct({...editingProduct, rating: Number(e.target.value)})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Review Count</label>
                  <input 
                    type="number" 
                    min="0"
                    step="1"
                    value={editingProduct.reviewCount || 0}
                    onChange={(e) => setEditingProduct({...editingProduct, reviewCount: Math.floor(Number(e.target.value))})}
                    onKeyDown={(e) => { if (e.key === '.' || e.key === 'e') e.preventDefault(); }}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-burgundy">Images</label>
                  {((editingProduct.images && editingProduct.images.length > 0) || newImagePreviews.length > 0) && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mb-4">
                      {editingProduct.images?.map((imgUrl, idx) => (
                        <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group border border-burgundy/10">
                          <img src={imgUrl} alt="existing" className="w-full h-full object-cover" />
                          <div className="absolute top-1 left-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-medium">Existing</div>
                          <button 
                            type="button"
                            onClick={() => removeExistingImage(imgUrl, idx)}
                            className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {newImagePreviews.map((preview, idx) => (
                        <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group border border-burgundy/10">
                          <img src={preview} alt="preview" className="w-full h-full object-cover" />
                          <div className="absolute top-1 left-1 bg-burgundy px-2 py-0.5 rounded text-[10px] text-white font-medium">New</div>
                          <button 
                            type="button"
                            onClick={() => removeNewImage(idx)}
                            className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-4 items-center">
                    <label className="cursor-pointer bg-white border border-dashed border-burgundy/30 hover:border-burgundy/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors flex-1">
                      <Upload size={24} className="text-burgundy/50" />
                      <span className="text-sm text-burgundy/60 font-medium">Click to upload additional images</span>
                      <input 
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Badge</label>
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
                
                <div>
                  <label className="block text-xs font-bold opacity-0 mb-2 font-ui tracking-wider pointer-events-none select-none">In Stock</label>
                  <div className="flex items-center gap-3 bg-ivory/30 px-4 h-12 rounded-xl border border-burgundy/10">
                    <Checkbox 
                      id="inStock"
                      checked={editingProduct.inStock} 
                      onCheckedChange={(checked) => setEditingProduct({...editingProduct, inStock: !!checked})} 
                    />
                    <label htmlFor="inStock" className="text-sm font-semibold text-burgundy cursor-pointer select-none">
                      Product In Stock
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 flex justify-end gap-3 border-t border-burgundy/10 bg-ivory/30 shrink-0 rounded-b-3xl">
              <button 
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 font-ui font-semibold text-burgundy/70 hover:text-burgundy transition-colors rounded-xl hover:bg-burgundy/5"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-burgundy text-white px-5 py-2 rounded-xl font-ui text-sm font-semibold hover:bg-wine transition-colors shadow-md shadow-burgundy/20 disabled:opacity-50"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
