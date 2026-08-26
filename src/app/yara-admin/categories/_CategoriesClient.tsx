'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import { useAdminCategories, useCreateCategory, useUpdateCategoryWithProducts, useDeleteCategory, useCategoryProducts, useAdminProducts, useAssignableCategoryProducts } from '@/lib/hooks/use-admin-products';
import { RawCategory, RawProduct } from '@/app/yara-admin/products/_ProductsClient';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function CategoriesClient({ initialCategories }: { initialCategories: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RawCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<RawCategory | null>(null);

  const { data, isLoading } = useAdminCategories({ success: true, categories: initialCategories });
  const categories = (data?.categories as RawCategory[]) || initialCategories;

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (cat: RawCategory) => {
    setCategoryToDelete(cat);
  };


  const openEdit = (cat: RawCategory) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-[1100px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-burgundy">Categories</h1>
          <p className="text-burgundy/60 font-body text-sm mt-1">
            Manage product categories and organize your product catalog.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-burgundy text-white px-5 py-2.5 rounded-full font-body text-sm font-medium hover:bg-burgundy/90 transition-colors shadow-md shadow-burgundy/20 self-start sm:self-auto"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-burgundy/5 flex flex-col sm:flex-row justify-between gap-4 bg-ivory/30">
          <div className="flex items-center gap-2 bg-white border border-burgundy/10 rounded-xl px-4 py-2 w-full sm:w-[320px] focus-within:border-burgundy/30 transition-colors">
            <Search size={16} className="text-burgundy/40 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none text-sm font-body text-burgundy placeholder:text-burgundy/40"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-burgundy/5 bg-rose-gold/5">
                <th className="py-3 px-4 text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wider w-[45%]">Name</th>
                <th className="py-3 px-4 text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wider w-[40%]">Slug</th>
                <th className="py-3 px-4 text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wider text-right w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-burgundy/50 font-body text-sm">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-burgundy/5 hover:bg-rose-gold/5 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-body font-medium text-burgundy">{cat.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-burgundy/60 font-mono bg-ivory/50 px-2 py-1 rounded border border-burgundy/5">
                        {cat.slug}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-1.5 text-burgundy/40 hover:text-burgundy hover:bg-burgundy/5 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cat)}
                          className="p-1.5 text-burgundy/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer padding to match other tables if no pagination */}
        <div className="p-4 border-t border-burgundy/5 bg-ivory/20 flex items-center justify-between">
          <span className="text-sm text-burgundy/60 font-body">
            Showing {filteredCategories.length} categor{filteredCategories.length === 1 ? 'y' : 'ies'}
          </span>
        </div>
      </div>
      
      {isModalOpen && (
        <CategoryModal 
          category={editingCategory}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {categoryToDelete && (
        <DeleteCategoryModal
          category={categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
        />
      )}
    </div>
  );
}

function DeleteCategoryModal({ category, onClose }: { category: RawCategory; onClose: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync: deleteCategory } = useDeleteCategory();

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await deleteCategory(category.id);
      if (!res.success) {
        setError(res.error);
        return;
      }
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-burgundy/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-burgundy/10 flex justify-between items-center bg-ivory/30">
          <h2 className="font-heading text-xl font-bold text-burgundy">
            Delete Category
          </h2>
          <button onClick={onClose} disabled={deleting} className="p-1.5 text-burgundy/40 hover:text-burgundy rounded-full hover:bg-burgundy/5 transition-colors disabled:opacity-50">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto">
          <div className="space-y-4">
            <p className="text-burgundy/80 font-body text-sm">
              Are you sure you want to delete <span className="font-semibold">"{category.name}"</span>?
            </p>
            <p className="text-burgundy/60 font-body text-sm">
              This action cannot be undone.
            </p>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600 font-body font-medium">{error}</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex gap-3 justify-end pt-4 border-t border-burgundy/5">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 rounded-full font-body text-sm font-medium text-burgundy/70 hover:text-burgundy hover:bg-burgundy/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-6 py-2 rounded-full font-body text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md shadow-red-600/20 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Category'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



function CategoryProductsManager({ 
  category,
  pendingAddProducts,
  setPendingAddProducts,
  pendingRemoveIds,
  setPendingRemoveIds
}: { 
  category: RawCategory;
  pendingAddProducts: RawProduct[];
  setPendingAddProducts: React.Dispatch<React.SetStateAction<RawProduct[]>>;
  pendingRemoveIds: Set<string>;
  setPendingRemoveIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;
  
  // NOTE: We don't invalidate this query on local adds/removes, so it remains the server truth
  const { data, isLoading } = useCategoryProducts(category.id, page, perPage);
  const rawProducts = (data?.products as unknown as RawProduct[]) || [];
  
  // Deduplicate server products
  const serverProducts = Array.from(new Map(rawProducts.map(p => [p.id, p])).values());
  
  // Combine server products and pending added products, and deduplicate again
  const combinedProducts = Array.from(new Map([...serverProducts, ...pendingAddProducts].map(p => [p.id, p])).values());

  const totalPages = data?.totalPages || 1;
  const totalItems = (data?.totalItems || 0) + pendingAddProducts.length;
  const fetchError = data?.success === false ? data.error : null;
  
  const handleToggleRemove = (productId: string, isPendingAdd: boolean) => {
    if (isPendingAdd) {
      // If it was just added locally, simply un-stage it
      setPendingAddProducts(prev => prev.filter(p => p.id !== productId));
    } else {
      // If it's a real server product, toggle its staged removal status
      setPendingRemoveIds(prev => {
        const next = new Set(prev);
        if (next.has(productId)) next.delete(productId);
        else next.add(productId);
        return next;
      });
    }
  };

  return (
    <div className="mt-8 border-t border-burgundy/10 pt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-ui font-semibold text-burgundy/70 uppercase tracking-wide">
            Products in this Category
          </h3>
          <p className="text-xs font-body text-burgundy/50 mt-0.5">
            {isLoading ? 'Loading...' : fetchError ? 'Unable to load category products.' : `${totalItems} Products`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs font-medium bg-burgundy/5 text-burgundy hover:bg-burgundy/10 transition-colors"
        >
          <Plus size={14} />
          Add Products
        </button>
      </div>

      {fetchError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm text-red-600 font-body font-medium">{fetchError}</p>
        </div>
      )}

      <div className="border border-burgundy/10 rounded-xl overflow-hidden bg-white max-h-[250px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 flex justify-center text-burgundy/40">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : fetchError ? (
          <div className="p-8 text-center text-sm font-body text-red-500/70">
            Unable to load products. Please try again.
          </div>
        ) : combinedProducts.length === 0 ? (
          <div className="p-8 text-center text-sm font-body text-burgundy/50">
            No products in this category yet.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-ivory/50 sticky top-0 z-10 border-b border-burgundy/5">
              <tr>
                <th className="py-2 px-3 text-[10px] font-ui font-semibold text-burgundy/60 uppercase">Product</th>
                <th className="py-2 px-3 text-[10px] font-ui font-semibold text-burgundy/60 uppercase">Stock</th>
                <th className="py-2 px-3 text-[10px] font-ui font-semibold text-burgundy/60 uppercase">Price</th>
                <th className="py-2 px-3 text-[10px] font-ui font-semibold text-burgundy/60 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-burgundy/5">
              {combinedProducts.map(p => {
                const isPendingAdd = pendingAddProducts.some(addP => addP.id === p.id);
                const isPendingRemove = pendingRemoveIds.has(p.id);
                
                return (
                  <tr key={p.id} className={`transition-colors ${isPendingRemove ? 'bg-red-50/50 opacity-60' : isPendingAdd ? 'bg-green-50/30' : 'hover:bg-rose-gold/5'}`}>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className={`text-sm font-body font-medium ${isPendingRemove ? 'text-burgundy/60 line-through' : 'text-burgundy'}`}>{p.name}</p>
                          <p className="text-xs font-mono text-burgundy/50">{p.productCode}</p>
                        </div>
                        {isPendingAdd && (
                          <span className="ml-2 inline-block bg-green-100 text-green-700 text-[10px] font-ui font-semibold uppercase px-2 py-0.5 rounded">
                            Will be added
                          </span>
                        )}
                        {isPendingRemove && (
                          <span className="ml-2 inline-block bg-red-100 text-red-700 text-[10px] font-ui font-semibold uppercase px-2 py-0.5 rounded">
                            Will be removed
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`text-xs font-body font-medium px-2 py-0.5 rounded-full ${
                        (p.quantity || 0) > 5 ? 'bg-green-100 text-green-700' :
                        (p.quantity || 0) > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.quantity || 0} in stock
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm font-body text-burgundy/70">
                      Rs. {p.price?.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {isPendingRemove ? (
                        <button
                          type="button"
                          onClick={() => handleToggleRemove(p.id, isPendingAdd)}
                          className="px-2 py-1 text-[10px] font-ui font-semibold uppercase text-burgundy bg-burgundy/5 hover:bg-burgundy/10 rounded transition-colors"
                        >
                          Undo
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleRemove(p.id, isPendingAdd)}
                          className="p-1.5 text-burgundy/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title={isPendingAdd ? "Undo Add" : "Remove from category"}
                        >
                          {isPendingAdd ? <X size={14} /> : <Trash2 size={14} />}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex justify-between items-center bg-ivory/30 p-2 rounded-lg border border-burgundy/5">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="px-3 py-1 text-xs font-body font-medium text-burgundy/70 hover:bg-burgundy/10 rounded-md transition-colors disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs font-mono text-burgundy/50">Page {page} of {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
            className="px-3 py-1 text-xs font-body font-medium text-burgundy/70 hover:bg-burgundy/10 rounded-md transition-colors disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {isAddModalOpen && (
        <AddCategoryProductsModal
          category={category}
          pendingAddProducts={pendingAddProducts}
          pendingRemoveIds={pendingRemoveIds}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(newProducts) => {
            setPendingAddProducts(prev => {
              const currentMap = new Map(prev.map(p => [p.id, p]));
              newProducts.forEach(p => currentMap.set(p.id, p));
              return Array.from(currentMap.values());
            });
            // If we're adding it, make sure it's not marked for removal
            setPendingRemoveIds(prev => {
              const next = new Set(prev);
              newProducts.forEach(p => next.delete(p.id));
              return next;
            });
          }}
        />
      )}
    </div>
  );
}

function AddCategoryProductsModal({ 
  category, 
  onClose,
  pendingAddProducts,
  pendingRemoveIds,
  onAdd
}: { 
  category: RawCategory;
  onClose: () => void;
  pendingAddProducts: RawProduct[];
  pendingRemoveIds: Set<string>;
  onAdd: (products: RawProduct[]) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const perPage = 20;
  const [error, setError] = useState<string | null>(null);

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [debouncedSearch]);
  
  const { data, isLoading } = useAssignableCategoryProducts(category.id, page, perPage, debouncedSearch);
  
  const catalogProducts = (data?.products as unknown as RawProduct[]) || [];
  const totalPages = data?.totalPages || 1;
  const availableProducts = catalogProducts;

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const [showWarning, setShowWarning] = useState(false);
  
  const selectedProducts = availableProducts.filter(p => selectedIds.has(p.id));
  const productsWithOtherCategory = selectedProducts.filter(p => p.category && p.category !== category.id);

  const handleConfirmAdd = () => {
    // Check if they are already in the target category AND not staged for removal
    const productsInSameCategory = selectedProducts.filter(p => p.category === category.id && !pendingRemoveIds.has(p.id));
    
    // Check if they are already staged to be added
    const productsAlreadyStaged = selectedProducts.filter(p => pendingAddProducts.some(addP => addP.id === p.id));
    
    if (productsInSameCategory.length > 0 || productsAlreadyStaged.length > 0) {
      setError(`Some selected products are already assigned to ${category.name}. Remove them from your selection before continuing.`);
      return;
    }
    
    if (productsWithOtherCategory.length > 0 && !showWarning) {
      setShowWarning(true);
      return;
    }
    
    onAdd(selectedProducts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-burgundy/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-burgundy/10 flex justify-between items-center bg-ivory/30">
          <div>
            <h2 className="font-heading text-xl font-bold text-burgundy">
              Add Products to "{category.name}"
            </h2>
            <p className="text-burgundy/60 font-body text-sm mt-0.5">
              Select products to assign to this category.
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-burgundy/40 hover:text-burgundy rounded-full hover:bg-burgundy/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5 border-b border-burgundy/5 bg-white">
          <div className="flex items-center gap-2 bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-2.5 focus-within:border-burgundy/30 transition-colors">
            <Search size={16} className="text-burgundy/40 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none text-sm font-body text-burgundy placeholder:text-burgundy/40"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-5">
          {isLoading ? (
            <div className="flex justify-center p-12 text-burgundy/40">
              <Loader2 className="animate-spin" size={28} />
            </div>
          ) : availableProducts.length === 0 ? (
            <div className="text-center p-12 text-burgundy/50 font-body text-sm">
              No available products found matching your search.
            </div>
          ) : (
            <div className="space-y-2">
              {availableProducts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => toggleSelect(p.id)}
                  className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedIds.has(p.id) 
                      ? 'border-burgundy/40 bg-rose-gold/5' 
                      : 'border-burgundy/5 hover:border-burgundy/20 hover:bg-ivory/30'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    selectedIds.has(p.id) ? 'bg-burgundy border-burgundy' : 'border-burgundy/30 bg-white'
                  }`}>
                    {selectedIds.has(p.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-body font-medium text-burgundy">{p.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs font-mono text-burgundy/50">{p.productCode}</span>
                      <span className="text-xs text-burgundy/30">•</span>
                      <span className="text-xs font-body text-burgundy/60">Rs. {p.price?.toLocaleString()}</span>
                      <span className="text-xs text-burgundy/30">•</span>
                      <span className={`text-[11px] font-body font-medium px-1.5 py-0.5 rounded ${
                        (p.quantity || 0) > 5 ? 'bg-green-100 text-green-700' :
                        (p.quantity || 0) > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.quantity || 0} in stock
                      </span>
                    </div>
                  </div>
                  
                  {p.category === category.id && !pendingRemoveIds.has(p.id) ? (
                    <div className="text-right pl-4 border-l border-burgundy/5">
                      <span className="inline-block bg-burgundy/5 text-burgundy/40 text-[10px] font-ui font-semibold uppercase px-2 py-1 rounded">
                        Already in this category
                      </span>
                    </div>
                  ) : pendingAddProducts.some(addP => addP.id === p.id) ? (
                    <div className="text-right pl-4 border-l border-burgundy/5">
                      <span className="inline-block bg-burgundy/5 text-burgundy/40 text-[10px] font-ui font-semibold uppercase px-2 py-1 rounded">
                        Already Staged
                      </span>
                    </div>
                  ) : p.category ? (
                    <div className="text-right pl-4 border-l border-burgundy/5">
                      <p className="text-[10px] font-ui font-semibold text-burgundy/40 uppercase">Current Category</p>
                      <p className="text-xs font-body text-burgundy/70 max-w-[120px] truncate">{p.expand?.category?.name || 'Another Category'}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center bg-ivory/20 p-2 rounded-lg border border-burgundy/5">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="px-3 py-1.5 text-xs font-body font-medium text-burgundy/70 hover:bg-burgundy/10 rounded-md transition-colors disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs font-mono text-burgundy/50">Page {page} of {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
                className="px-3 py-1.5 text-xs font-body font-medium text-burgundy/70 hover:bg-burgundy/10 rounded-md transition-colors disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600 font-body font-medium">{error}</p>
          </div>
        )}

        {showWarning && (
          <div className="p-4 bg-orange-50 border-t border-orange-100">
            <div className="flex gap-3">
              <AlertCircle className="text-orange-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-body font-semibold text-orange-800">
                  Category Reassignment Warning
                </p>
                <p className="text-sm font-body text-orange-700 mt-1">
                  {productsWithOtherCategory.length} selected product(s) currently belong to another category. 
                  Adding them here will move them to <span className="font-bold">"{category.name}"</span>.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-5 border-t border-burgundy/5 flex justify-between items-center bg-ivory/10">
          <span className="text-sm font-body text-burgundy/70">
            <span className="font-semibold text-burgundy">{selectedIds.size}</span> products selected
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full font-body text-sm font-medium text-burgundy/70 hover:text-burgundy hover:bg-burgundy/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAdd}
              disabled={selectedIds.size === 0}
              className="px-6 py-2 rounded-full font-body text-sm font-medium bg-burgundy text-white hover:bg-burgundy/90 transition-colors shadow-md shadow-burgundy/20 disabled:opacity-50"
            >
              {showWarning ? 'Move Products' : 'Add Selected Products'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryModal({ category, onClose }: { category: RawCategory | null; onClose: () => void }) {
  const isEditing = !!category;
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [description, setDescription] = useState(category?.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [pendingAddProducts, setPendingAddProducts] = useState<RawProduct[]>([]);
  const [pendingRemoveIds, setPendingRemoveIds] = useState<Set<string>>(new Set());

  const { mutateAsync: createCategory } = useCreateCategory();
  const { mutateAsync: updateCategoryWithProducts } = useUpdateCategoryWithProducts();

  const isDirty = 
    name !== (category?.name || '') ||
    slug !== (category?.slug || '') ||
    description !== (category?.description || '') ||
    pendingAddProducts.length > 0 ||
    pendingRemoveIds.size > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return setError("Name and Slug are required");
    setError(null);
    
    setSaving(true);
    try {
      if (isEditing && category) {
        const res = await updateCategoryWithProducts({ 
          id: category.id, 
          data: { name, slug, description },
          addProducts: pendingAddProducts.map(p => p.id),
          removeProducts: Array.from(pendingRemoveIds)
        });
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createCategory({ name, slug, description });
        if (!res.success) throw new Error(res.error);
      }
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-burgundy/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-burgundy/10 flex justify-between items-center bg-ivory/30">
          <h2 className="font-heading text-xl font-bold text-burgundy">
            {isEditing ? 'Edit Category' : 'Add Category'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-burgundy/40 hover:text-burgundy rounded-full hover:bg-burgundy/5 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600 font-body font-medium">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white border border-burgundy/10 rounded-xl px-4 py-2.5 outline-none focus:border-burgundy/30 transition-colors text-burgundy font-body text-sm placeholder:text-burgundy/30"
                placeholder="e.g. Necklaces"
              />
            </div>
            
            <div>
              <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Slug <span className="text-red-400">*</span></label>
              <input
                type="text"
                required
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="w-full bg-white border border-burgundy/10 rounded-xl px-4 py-2.5 outline-none focus:border-burgundy/30 transition-colors text-burgundy font-mono text-sm placeholder:text-burgundy/30"
                placeholder="e.g. necklaces"
              />
            </div>

            <div>
              <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-white border border-burgundy/10 rounded-xl px-4 py-2.5 outline-none focus:border-burgundy/30 transition-colors text-burgundy font-body text-sm placeholder:text-burgundy/30 resize-none"
                placeholder="Optional description..."
              />
            </div>
          </div>
          
          {isEditing && category && (
            <CategoryProductsManager 
              category={category}
              pendingAddProducts={pendingAddProducts}
              setPendingAddProducts={setPendingAddProducts}
              pendingRemoveIds={pendingRemoveIds}
              setPendingRemoveIds={setPendingRemoveIds}
            />
          )}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-between items-center pt-4 border-t border-burgundy/5">
            <div className="text-sm font-body text-burgundy/60">
              {isDirty && isEditing && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                  Unsaved changes
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full font-body text-sm font-medium text-burgundy/70 hover:text-burgundy hover:bg-burgundy/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || (!isDirty && isEditing)}
                className="px-6 py-2 rounded-full font-body text-sm font-medium bg-burgundy text-white hover:bg-burgundy/90 transition-colors shadow-md shadow-burgundy/20 disabled:opacity-50"
              >
                {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Category')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
