'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Filter, Plus, MoreVertical, Edit2, Trash2, X, Save, ChevronDown, RefreshCw, CheckCircle2 } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { getAllProducts } from '@/lib/data/products';
import { Product, Category } from '@/types';
import { EditProductModal } from './components/EditProductModal';
import imageCompression from 'browser-image-compression';
import { ProductsTable } from './components/ProductsTable';
import { ProductsToolbar } from './components/ProductsToolbar';
import { ProductsPagination } from './components/ProductsPagination';
import { TableSkeleton } from '@/components/admin/TableSkeleton';
import { formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/pocketbase';
import { updateProductDetailsAction, updateProductWithFilesAction, deleteProductAction, duplicateProductAction, deleteProductsAction } from '@/app/actions/products';
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
  const newImageFiles = useRef<File[]>([]);
  const pendingCompressions = useRef<Promise<any>[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const imagesToDelete = useRef<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortOption, setSortOption] = useState('Sort by: Newest');

  useEffect(() => {
    return () => {
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

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
      // Optimistic UI update: instantly remove from screen
      const previousList = [...productList];
      setProductList(prev => prev.filter(p => p.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      
      const res = await deleteProductAction(id);
      
      if (res?.error) {
        // Rollback on failure
        setProductList(previousList);
        alert(`Failed to delete: ${res.error}`);
        return;
      }
      showNotification('Product deleted successfully');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
      const count = selectedIds.length;
      const idsToDelete = [...selectedIds];
      
      // Optimistic UI update
      const previousList = [...productList];
      setProductList(prev => prev.filter(p => !idsToDelete.includes(p.id)));
      setSelectedIds([]);
      
      const res = await deleteProductsAction(idsToDelete);
      
      if (res?.error) {
        // Rollback
        setProductList(previousList);
        setSelectedIds(idsToDelete);
        alert(`Failed to delete products: ${res.error}`);
        return;
      }
      
      showNotification(`Successfully deleted ${count} products`);
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
    newImageFiles.current = [];
    setNewImagePreviews([]);
    imagesToDelete.current = [];
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      // 1. Immediately show previews for instant UI feedback
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...newPreviews]);
      
      // 2. Temporarily push original files to maintain order and allow immediate saving
      newImageFiles.current.push(...filesArray);
      
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      // 3. Compress in the background without blocking the UI
      const compressionPromises = filesArray.map(async (originalFile) => {
        try {
          const compressedFile = await imageCompression(originalFile, options);
          // Find by exact reference in case user reordered or deleted images while compressing
          const index = newImageFiles.current.findIndex(f => f === originalFile);
          if (index !== -1) {
            newImageFiles.current[index] = compressedFile;
          }
        } catch (error) {
          console.error("Error compressing image:", error);
          // If it fails, the original file is already in the array
        }
      });
      pendingCompressions.current.push(...compressionPromises);
    }
  };

  const removeNewImage = (index: number) => {
    newImageFiles.current = newImageFiles.current.filter((_, i) => i !== index);
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imgUrl: string, index: number) => {
    const filename = imgUrl.split('/').pop();
    if (filename && filename !== 'placeholder.png') {
      imagesToDelete.current = [...imagesToDelete.current, filename];
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
      if (pendingCompressions.current.length > 0) {
        await Promise.all(pendingCompressions.current);
        pendingCompressions.current = [];
      }
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
      
      // DO NOT attach new images to submitData to avoid 1MB/4.5MB Vercel/Nginx limits
      // We will upload them directly from the browser below.
      if (imagesToDelete.current.length > 0) {
        imagesToDelete.current.forEach(filename => {
          submitData.append('images.-', filename);
        });
      }

      // 1. Update text details and process deletions
      const { updateProductDetailsAction, getAdminTokenAction } = await import('@/app/actions/products');
      const res = await updateProductDetailsAction(editingProduct.id, submitData as any);
      if (res.error) {
        throw new Error(res.error);
      }

      // 2. Upload new images directly and sequentially to avoid all limits & race conditions
      if (newImageFiles.current && newImageFiles.current.length > 0) {
        const tokenResult = await getAdminTokenAction();
        if (tokenResult.token) {
          const PB_BASE = '/pb';
          for (let i = 0; i < newImageFiles.current.length; i++) {
            const file = newImageFiles.current[i];
            const fileName = (file as File).name || `image-new-${i}.jpg`;
            const mimeType = file.type || 'image/jpeg';
            
            const imageFormData = new FormData();
            imageFormData.append('images', new File([file], fileName, { type: mimeType }));
            
            try {
              const uploadRes = await fetch(`${PB_BASE}/api/collections/products/records/${editingProduct.id}`, {
                method: 'PATCH',
                headers: { Authorization: tokenResult.token },
                body: imageFormData,
              });
              if (!uploadRes.ok) console.error(`Failed to upload new image ${i+1}`);
            } catch (err) {
              console.error(`Network error uploading new image ${i+1}:`, err);
            }
          }
        }
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

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
        <ProductsToolbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          sortOption={sortOption}
          setSortOption={setSortOption}
          setCurrentPage={setCurrentPage}
          isLoading={isLoading}
          fetchProducts={fetchProducts}
          selectedIds={selectedIds}
          handleBulkDelete={handleBulkDelete}
        />

        {/* Table */}
        {isLoading ? (
          <TableSkeleton columns={7} rows={8} />
        ) : (
          <ProductsTable 
            paginatedProducts={paginatedProducts}
            handleEdit={handleEdit}
            handleDuplicate={handleDuplicate}
            toggleProductStatus={handleToggleVisibility}
            handleDelete={handleDelete}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
          />
        )}
        
        {/* Pagination */}
        <ProductsPagination 
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={totalItems}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
        />
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          categories={categories}
          isSaving={isSaving}
          handleSave={handleSave}
          newImagePreviews={newImagePreviews}
          handleImageChange={handleImageChange}
          removeNewImage={removeNewImage}
          removeExistingImage={removeExistingImage}
        />
      )}

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <m.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 font-body font-medium"
          >
            <CheckCircle2 size={20} className="text-emerald-100" />
            {notification}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
