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

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

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

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Product',
      description: 'Are you sure you want to delete this product? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
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
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Multiple Products',
      description: `Are you sure you want to delete ${selectedIds.length} products?`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
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
    });
  };

  const handleDuplicate = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Duplicate Product',
      description: 'Are you sure you want to duplicate this product?',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        const res = await duplicateProductAction(id);
        if (res.error) {
          alert(res.error);
          return;
        }
        getAllProducts().then(setProductList);
      }
    });
  };

  const handleToggleVisibility = async (product: Product) => {
    const newState = !product.isActive;
    
    // Optimistic UI update: instantly change state
    const previousList = [...productList];
    setProductList(prev => prev.map(p => p.id === product.id ? { ...p, isActive: newState } : p));
    const res = await updateProductDetailsAction(product.id, JSON.stringify({ is_active: newState }));
    if (res?.error) {
      // Rollback on failure
      setProductList(previousList);
      alert(`Failed to update visibility: ${res.error}`);
      return;
    }
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
      
      const desc = editingProduct.description.startsWith('<p>') ? editingProduct.description : `<p>${editingProduct.description}</p>`;
      
      const payload: any = {
        name: editingProduct.name,
        price: (editingProduct.price as any) === '' ? null : Number(editingProduct.price),
        originalPrice: (editingProduct.originalPrice as any) === '' ? null : Number(editingProduct.originalPrice),
        category: categoryId || '',
        inStock: editingProduct.inStock,
        badge: editingProduct.badge || '',
        shortDescription: editingProduct.shortDescription || '',
        description: desc,
        material: editingProduct.material || '',
        weight: editingProduct.weight || '',
        rating: (editingProduct.rating as any) === '' ? 0 : Number(editingProduct.rating),
        reviewCount: (editingProduct.reviewCount as any) === '' ? 0 : Number(editingProduct.reviewCount),
        colors: editingProduct.colors || [],
        tags: editingProduct.tags || [],
      };
      
      if (!editingProduct.name.trim() || (editingProduct.price as any) === '' || editingProduct.price === null || editingProduct.price === undefined || !editingProduct.shortDescription?.trim() || !editingProduct.description?.trim()) {
        showNotification("Error: Name, Price, Short Description, and Full Description are required.");
        setIsSaving(false);
        return;
      }
      
      if (imagesToDelete.current.length > 0) {
        payload['images.-'] = imagesToDelete.current;
      }

      // Save previous state for rollback
      const previousProduct = productList.find(p => p.id === editingProduct.id);

      // OPTIMISTIC UI UPDATE: Instantly close modal and update table
      setProductList(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
      setEditingProduct(null);
      setIsSaving(false);

      // FIRE AND FORGET BACKGROUND TASKS
      (async () => {
        try {
          // 1. Update text details and process deletions
          const { updateProductDetailsAction, getAdminTokenAction } = await import('@/app/actions/products');
          const res = await updateProductDetailsAction(editingProduct.id, JSON.stringify(payload));
          if (res.error) throw new Error(res.error);

          // 2. Upload new images directly and sequentially
          if (newImageFiles.current && newImageFiles.current.length > 0) {
            const tokenResult = await getAdminTokenAction();
            if (tokenResult.token) {
              const PB_BASE = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.yarasl.shop';
              const imageFormData = new FormData();
              
              // Retain existing images by appending their filenames
              if (editingProduct.images && editingProduct.images.length > 0) {
                editingProduct.images.forEach(img => {
                  imageFormData.append('images', img);
                });
              }
              
              // Append all new image files
              for (let i = 0; i < newImageFiles.current.length; i++) {
                const file = newImageFiles.current[i];
                const fileName = (file as File).name || `image-new-${i}.jpg`;
                const mimeType = file.type || 'image/jpeg';
                imageFormData.append('images', new File([file], fileName, { type: mimeType }));
              }
              
              try {
                const imgRes = await fetch(`${PB_BASE}/api/collections/products/records/${editingProduct.id}`, {
                  method: 'PATCH',
                  headers: { Authorization: tokenResult.token },
                  body: imageFormData,
                });
                if (!imgRes.ok) {
                   console.error("Image upload failed:", await imgRes.text());
                }
              } catch (err) {
                console.error("Fetch error during image upload:", err);
              }
              const { revalidateProductsAction } = await import('@/app/actions/products');
              await revalidateProductsAction();
            }
          }
          
          fetch('/api/revalidate?path=/', { method: 'POST' }).catch(() => {});
        } catch (err: any) {
          console.error('Background save failed', err);
          showNotification(`Error saving product: ${err.message}`);
          if (previousProduct) {
            setProductList(prev => prev.map(p => p.id === previousProduct.id ? previousProduct : p));
          }
        }
      })();

    } catch (err: any) {
      console.error('Failed to prepare update', err);
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

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-burgundy/10"
            >
              <h3 className="font-heading font-bold text-xl text-burgundy mb-2">{confirmModal.title}</h3>
              <p className="font-body text-burgundy/70 text-sm mb-6">{confirmModal.description}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3 px-4 rounded-xl font-ui font-semibold text-burgundy bg-ivory/50 hover:bg-champagne/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 py-3 px-4 rounded-xl font-ui font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

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
