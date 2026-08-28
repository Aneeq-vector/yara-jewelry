'use client';
import { queryKeys } from '@/lib/query-keys';

import { useState, useEffect, useRef, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Edit2,
  ChevronDown,
  X,
  Upload,
  Star,
  Package,
  ImageIcon,
  Tag,
  CheckCircle2,
  AlertCircle,
  Copy,
  GripVertical,
} from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ProductsPagination } from './components/ProductsPagination';
import {
  revalidateProductsAction,
  saveProductAction,
} from '@/app/actions/products';
import { useAdminProducts, useAdminCategories } from '@/lib/hooks/use-admin-products';
import { useDeleteProduct, useDeleteProducts, useDuplicateProduct } from '@/lib/hooks/use-products';
import { PB_URL } from '@/lib/pocketbase';
import { useQueryClient } from '@tanstack/react-query';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RawCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  collectionId: string;
}

export interface RawProduct {
  id: string;
  collectionId: string;
  productCode?: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  shortDescription: string;
  category?: string;
  images?: string[];
  imagePositions?: string[];
  badge?: string;
  rating?: number;
  reviewCount?: number;
  material?: string;
  weight?: string;
  quantity?: number;
  inStock?: boolean;
  colors?: string[];
  customColors?: { name: string; hex: string }[];
  colorStock?: Record<string, number>;
  inventoryMode?: 'global' | 'color';
  tags?: string[];
  created: string;
  updated: string;
  expand?: { category?: RawCategory };
}

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; message: string; type: ToastType }

const BADGE_OPTIONS = ['trending', 'best-seller', 'limited', 'new'];
const COLOR_OPTIONS = ['Gold', 'Silver', 'Rose Gold', 'Platinum', 'Black', 'Yellow', 'Purple', 'Green', 'Pink'];
const TAG_OPTIONS = [
  'necklace','gold','minimalist','earrings','rings','bracelets',
  'silver','diamonds','pearls','bestseller','new','sale','trendy','classic','bridal',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(collectionId: string, recordId: string, filename: string) {
  if (!filename) return '/placeholder.png';
  if (filename.startsWith('http')) return filename;
  return `${PB_URL}/api/files/${collectionId}/${recordId}/${filename}`;
}

function formatPrice(price: number) {
  return `Rs. ${price?.toLocaleString() ?? '—'}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Empty Form State ─────────────────────────────────────────────────────────

function generateProductCode() {
  return 'YR-' + Math.floor(100000 + Math.random() * 900000);
}

export interface FormImage {
  id: string;
  isExisting: boolean;
  filename?: string;
  file?: File;
  previewUrl: string;
  position: string;
}

function emptyForm() {
  return {
    productCode: generateProductCode(),
    name: '',
    price: '',
    originalPrice: '',
    shortDescription: '',
    description: '',
    category: '',
    badge: '',
    rating: '',
    reviewCount: '',
    material: '',
    weight: '',
    quantity: '',
    inStock: true,
    colors: [] as string[],
    customColors: [] as { name: string; hex: string }[],
    colorStock: {} as Record<string, number>,
    inventoryMode: 'global' as 'global' | 'color',
    tags: [] as string[],
    unifiedImages: [] as FormImage[],
  };
}

type FormState = ReturnType<typeof emptyForm>;

// ─── Toast Container ──────────────────────────────────────────────────────────

function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-body font-medium pointer-events-auto transition-all duration-300 ${
            t.type === 'success' ? 'bg-emerald-600 text-white' :
            t.type === 'error' ? 'bg-red-500 text-white' :
            'bg-burgundy text-white'
          }`}
        >
          {t.type === 'success' ? <CheckCircle2 size={16} /> : t.type === 'error' ? <AlertCircle size={16} /> : <Package size={16} />}
          {t.message}
          <button onClick={() => remove(t.id)} className="ml-2 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Chip Picker (multi-select) ───────────────────────────────────────────────

function ChipPicker({
  label, options, selected, onChange, limit,
}: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void; limit?: number;
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      if (limit && selected.length >= limit) return;
      onChange([...selected, opt]);
    }
  };

  return (
    <div>
      <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1 rounded-full text-xs font-body border transition-all duration-150 ${
              selected.includes(opt)
                ? 'bg-burgundy text-white border-burgundy'
                : 'bg-ivory border-burgundy/20 text-burgundy/70 hover:border-burgundy/50 hover:text-burgundy'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Product Form Modal ───────────────────────────────────────────────────────

function ProductFormModal({
  mode, product, categories, onClose, onSaved, addToast,
}: {
  mode: 'add' | 'edit';
  product?: RawProduct;
  categories: RawCategory[];
  onClose: () => void;
  onSaved: (p: RawProduct, mode: 'add' | 'edit') => void;
  addToast: (msg: string, type: ToastType) => void;
}) {
  const [form, setForm] = useState<FormState>(() => {
    if (mode === 'edit' && product) {
      return {
        productCode: product.productCode ?? '',
        name: product.name ?? '',
        price: product.price?.toString() ?? '',
        originalPrice: product.originalPrice?.toString() ?? '',
        shortDescription: product.shortDescription ?? '',
        description: product.description ?? '',
        category: product.category ?? '',
        badge: product.badge ?? '',
        rating: product.rating?.toString() ?? '',
        reviewCount: product.reviewCount?.toString() ?? '',
        material: product.material ?? '',
        weight: product.weight ?? '',
        quantity: product.quantity?.toString() ?? '',
        inStock: product.inStock ?? true,
        colors: product.colors ?? [],
        customColors: product.customColors ?? [],
        colorStock: product.colorStock ?? {},
        inventoryMode: product.inventoryMode || 'global',
        tags: product.tags ?? [],
        unifiedImages: (product.images ?? []).map((img, i) => ({
          id: img,
          isExisting: true,
          filename: img,
          previewUrl: buildImageUrl(product.collectionId, product.id, img),
          position: product.imagePositions?.[i] ?? '50% 50%',
        })),
      };
    }
    return emptyForm();
  });

  const [savingState, setSavingState] = useState<string | null>(null);
  const [showCustomColorForm, setShowCustomColorForm] = useState(false);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#1F8A5B');
  const [customColorQuantity, setCustomColorQuantity] = useState('0');
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!showCustomColorForm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCustomColorForm(false);
        setCustomColorName('');
        setCustomColorHex('#1F8A5B');
        setCustomColorQuantity('0');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCustomColorForm]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setForm((prev) => {
        const oldIndex = prev.unifiedImages.findIndex((i) => i.id === active.id);
        const newIndex = prev.unifiedImages.findIndex((i) => i.id === over.id);
        return { ...prev, unifiedImages: arrayMove(prev.unifiedImages, oldIndex, newIndex) };
      });
    }
  };

  const set = (key: keyof FormState, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter(f =>
      ['image/jpeg', 'image/png', 'image/heic', 'image/heif'].includes(f.type)
    );
    if (form.unifiedImages.length + arr.length > 10) { 
      addToast('Maximum 10 images allowed', 'error'); return; 
    }
    const newItems = arr.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      isExisting: false,
      file,
      previewUrl: URL.createObjectURL(file),
      position: '50% 50%'
    }));
    set('unifiedImages', [...form.unifiedImages, ...newItems]);
  };

  const removeImage = (id: string) => {
    const imgToRemove = form.unifiedImages.find(img => img.id === id);
    if (imgToRemove && imgToRemove.previewUrl && !imgToRemove.previewUrl.startsWith('http')) {
      URL.revokeObjectURL(imgToRemove.previewUrl);
    }
    set('unifiedImages', form.unifiedImages.filter(img => img.id !== id));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.toString().trim()) errs.name = 'Name is required';
    if (!form.price || isNaN(Number(form.price))) errs.price = 'Valid price is required';
    if (!form.shortDescription.toString().trim()) errs.shortDescription = 'Short description is required';
    if (!form.description.toString().trim()) errs.description = 'Description is required';
    if (form.inventoryMode === 'global') {
      if (form.quantity === '') {
         errs.quantity = 'Enter a stock quantity (or 0 if out of stock).';
      } else if (Number(form.quantity) < 0) {
         errs.quantity = 'Quantity cannot be negative.';
      }
    } else {
      // Color mode validation
      // (Equality requirement removed: admin is permitted to update inventory while converting modes)
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSavingState('Optimizing images...');

    let res: any;
    try {
      // Build FormData
      const fd = new FormData();
      if (form.productCode) fd.append('productCode', form.productCode.toString());
      fd.append('name', form.name.toString());
      fd.append('price', form.price.toString());
      if (form.originalPrice) fd.append('originalPrice', form.originalPrice.toString());
      fd.append('shortDescription', form.shortDescription.toString());
      fd.append('description', form.description.toString());
      fd.append('category', form.category ? form.category.toString() : '');
      fd.append('badge', form.badge.toString());
      if (form.rating) fd.append('rating', form.rating.toString());
      if (form.reviewCount) fd.append('reviewCount', form.reviewCount.toString());
      if (form.material) fd.append('material', form.material.toString());
      if (form.weight) fd.append('weight', form.weight.toString());
      
      const qty = Number(form.quantity) || 0;
      fd.append('quantity', qty.toString());
      fd.append('inStock', qty > 0 ? 'true' : 'false');
      
      (form.colors as string[]).forEach(c => fd.append('colors', c));
      (form.tags as string[]).forEach(t => fd.append('tags', t));
      fd.append('inventoryMode', form.inventoryMode);
      fd.append('customColors', JSON.stringify(form.customColors));
      
      let finalQty = 0;
      if (form.inventoryMode === 'color') {
        const colorStockMap = form.colorStock as Record<string, number>;
        const validColorStock: Record<string, number> = {};
        const activeColors = [...(form.colors as string[]), ...(form.customColors as any[]).map(c=>c.name)];
        
        for (const c of activeColors) {
          validColorStock[c] = Number(colorStockMap[c]) || 0;
          finalQty += validColorStock[c];
        }
        fd.append('colorStock', JSON.stringify(validColorStock));
        fd.set('quantity', finalQty.toString());
        fd.set('inStock', finalQty > 0 ? 'true' : 'false');
      } else {
        fd.append('colorStock', JSON.stringify({}));
      }

      const positionsArray = form.unifiedImages.map(img => img.position);
      fd.append('imagePositions', JSON.stringify(positionsArray));

      const options = {
        maxSizeMB: 1.5, 
        maxWidthOrHeight: 1920, 
        useWebWorker: true,
      };

      const uploadImages: any[] = new Array(form.unifiedImages.length);
      const concurrencyLimit = 3;
      let currentIndex = 0;

      const worker = async () => {
        while (currentIndex < form.unifiedImages.length) {
          const index = currentIndex++;
          const item = form.unifiedImages[index];

          if (item.isExisting && item.filename) {
             uploadImages[index] = { isExisting: true, data: item.filename };
          } else if (item.file) {
             const isOptimizedType = ['image/webp', 'image/avif', 'image/jpeg'].includes(item.file.type);
             const isSmallEnough = item.file.size < 650 * 1024;
             if (isOptimizedType && isSmallEnough) {
                uploadImages[index] = { isExisting: false, data: item.file, name: item.file.name };
             } else {
               try {
                 const compressed = await imageCompression(item.file, options);
                 uploadImages[index] = { isExisting: false, data: compressed, name: compressed.name || item.file.name };
               } catch (error) {
                 console.error('Image compression failed for', item.file.name, error);
                 if (item.file.size > 2 * 1024 * 1024) {
                   throw new Error(`Could not optimize ${item.file.name}. Please try the image again.`);
                 }
                 uploadImages[index] = { isExisting: false, data: item.file, name: item.file.name };
               }
             }
          } else {
             uploadImages[index] = null;
          }
        }
      };

      const workers = Array.from({ length: Math.min(concurrencyLimit, form.unifiedImages.length) }, () => worker());
      try {
        await Promise.all(workers);
      } catch (err: any) {
        setSavingState(null);
        addToast(err.message, 'error');
        return;
      }

      let totalNewSize = 0;
      for (const res of uploadImages) {
        if (res && !res.isExisting && res.data) {
          if (res.data.size > 2 * 1024 * 1024) {
            setSavingState(null);
            addToast(`Image ${res.name} exceeds the 2MB limit after optimization.`, 'error');
            return;
          }
          totalNewSize += res.data.size;
        }
      }

      if (totalNewSize > 16 * 1024 * 1024) {
        setSavingState(null);
        addToast('The selected images are still too large to upload together. Please remove one or more images and try again.', 'error');
        return;
      }

      for (const res of uploadImages) {
        if (res) {
           if (res.isExisting) fd.append('images', res.data as string);
           else fd.append('images', res.data as Blob, res.name);
        }
      }

      setSavingState('Uploading images...');
      const actionRes = await saveProductAction(fd, mode === 'edit' ? product?.id : undefined);
      
      if (!actionRes.success) {
        throw new Error(actionRes.error || 'Failed to save product');
      }
      
      res = { success: true, product: actionRes.product };

    } catch (err: any) {
      console.error('Product save error:', err);
      res = { error: err.message || 'Failed to save product' };
    }
    
    setSavingState(null);
    if (res?.success && res.product) {
      addToast(mode === 'add' ? 'Product created!' : 'Product updated!', 'success');
      onSaved(res.product as RawProduct, mode);
      onClose();
    } else {
      addToast(res?.error || 'Failed to save product', 'error');
    }
  };

  const inp = (field: keyof FormState) =>
    `w-full px-3 py-2 border rounded-xl text-sm font-body text-burgundy bg-white placeholder:text-burgundy/30 focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? 'border-red-400 focus:ring-red-200'
        : 'border-burgundy/20 focus:ring-burgundy/20 focus:border-burgundy/50'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-burgundy/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-burgundy/10 rounded-2xl shadow-2xl w-full max-w-3xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-burgundy/10 bg-ivory/40 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-heading font-bold text-burgundy">
              {mode === 'add' ? 'Add New Product' : 'Edit Product'}
            </h2>
            <p className="text-xs text-burgundy/50 font-body mt-0.5">
              {mode === 'add' ? 'Fill in the details to list a new product.' : `Editing: ${product?.name}`}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-burgundy/40 hover:text-burgundy hover:bg-rose-gold/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[78vh]">

          {/* Basic Info */}
          <section>
            <p className="text-xs font-ui font-semibold text-burgundy/40 uppercase tracking-widest mb-4">Basic Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Product Code</label>
                <input aria-label="Product code" type="text" placeholder="e.g. YR-001" value={form.productCode.toString()} onChange={e => set('productCode', e.target.value)} className={inp('productCode')} />
              </div>
              <div>
                <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Name <span className="text-red-400">*</span></label>
                <input aria-label="Product name" type="text" placeholder="Product name" value={form.name.toString()} onChange={e => set('name', e.target.value)} className={inp('name')} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Price (Rs.) <span className="text-red-400">*</span></label>
                <input aria-label="Price" type="number" min={0} step="0.01" placeholder="0.00" value={form.price.toString()} onChange={e => set('price', e.target.value)} className={inp('price')} />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Original Price (Rs.)</label>
                <input aria-label="Original price" type="number" min={0} step="0.01" placeholder="0.00" value={form.originalPrice.toString()} onChange={e => set('originalPrice', e.target.value)} className={inp('originalPrice')} />
              </div>
              <div>
                <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Quantity</label>
                <input 
  id="quantity-input" 
  aria-label="Quantity" 
  type="number" min={0} step="1" placeholder="0" 
  value={form.inventoryMode === 'color' ? Object.values(form.colorStock as Record<string,number>).reduce((sum, q) => sum + (Number(q) || 0), 0) : form.quantity.toString()} 
  onChange={e => set('quantity', e.target.value)} 
  disabled={form.inventoryMode === 'color'}
  className={`${inp('quantity')} ${form.inventoryMode === 'color' ? 'bg-gray-100 cursor-not-allowed text-burgundy/50' : ''}`} 
/>
{form.inventoryMode === 'color' && <p className="text-[10px] text-burgundy/50 mt-1">Auto-calculated from color stock</p>}
                {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
              </div>
            </div>
          </section>

          {/* Descriptions */}
          <section>
            <p className="text-xs font-ui font-semibold text-burgundy/40 uppercase tracking-widest mb-4">Descriptions</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Short Description <span className="text-red-400">*</span></label>
                <input aria-label="Short description" type="text" placeholder="One-line summary" value={form.shortDescription.toString()} onChange={e => set('shortDescription', e.target.value)} className={inp('shortDescription')} />
                {errors.shortDescription && <p className="text-xs text-red-500 mt-1">{errors.shortDescription}</p>}
              </div>
              <div>
                <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Full Description <span className="text-red-400">*</span></label>
                <textarea aria-label="Full description" rows={4} placeholder="Full product description" value={form.description.toString()} onChange={e => set('description', e.target.value)} className={`${inp('description')} resize-none`} />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
            </div>
          </section>

          {/* Details & Classification */}
          <section>
            <p className="text-xs font-ui font-semibold text-burgundy/40 uppercase tracking-widest mb-4">Details & Classification</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Category</label>
                <select aria-label="Category" value={form.category.toString()} onChange={e => set('category', e.target.value)} className={inp('category')}>
                  <option value="">— None —</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Badge</label>
                <select aria-label="Badge" value={form.badge.toString()} onChange={e => set('badge', e.target.value)} className={inp('badge')}>
                  <option value="">— None —</option>
                  {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b.replace(/-/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Material</label>
                <input aria-label="Material" type="text" placeholder="e.g. 18K Gold" value={form.material.toString()} onChange={e => set('material', e.target.value)} className={inp('material')} />
              </div>
              <div>
                <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Weight</label>
                <input aria-label="Weight" type="text" placeholder="e.g. 5.2g" value={form.weight.toString()} onChange={e => set('weight', e.target.value)} className={inp('weight')} />
              </div>
              <div>
                <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Rating (0–5)</label>
                <input aria-label="Rating" type="number" min={0} max={5} step={0.1} placeholder="4.5" value={form.rating.toString()} onChange={e => set('rating', e.target.value)} className={inp('rating')} />
              </div>
              <div>
                <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Review Count</label>
                <input aria-label="Review count" type="number" min={0} placeholder="0" value={form.reviewCount.toString()} onChange={e => set('reviewCount', e.target.value)} className={inp('reviewCount')} />
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const isOutOfStock = !form.quantity || Number(form.quantity) <= 0;
                  if (!isOutOfStock) {
                    set('quantity', '0');
                  } else {
                    set('quantity', '');
                    setTimeout(() => document.getElementById('quantity-input')?.focus(), 0);
                  }
                }}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${(!form.quantity || Number(form.quantity) <= 0) ? 'bg-burgundy/20' : 'bg-emerald-500'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${(!form.quantity || Number(form.quantity) <= 0) ? 'translate-x-0' : 'translate-x-6'}`} />
              </button>
              <span className="text-sm font-body text-burgundy cursor-pointer" onClick={() => {
                  const isOutOfStock = !form.quantity || Number(form.quantity) <= 0;
                  if (!isOutOfStock) {
                    set('quantity', '0');
                  } else {
                    set('quantity', '');
                    setTimeout(() => document.getElementById('quantity-input')?.focus(), 0);
                  }
                }}>
                {(!form.quantity || Number(form.quantity) <= 0) ? 'Out of Stock' : 'In Stock'}
              </span>
            </div>
          </section>

          {/* Inventory Mode & Colors */}
          <section className="space-y-4">
            <div className="bg-ivory/30 p-4 rounded-xl border border-burgundy/10">
              <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-2">Inventory Tracking Mode</label>
              <select 
                value={form.inventoryMode} 
                onChange={e => set('inventoryMode', e.target.value)} 
                className={inp('inventoryMode')}
              >
                <option value="global">Global (Single Stock)</option>
                <option value="color">Per-Color Stock</option>
              </select>
              <p className="text-[10px] text-burgundy/50 mt-1">
                {form.inventoryMode === 'global' ? 'Inventory is tracked at the product level.' : 'Inventory is tracked per individual color variant. Total product quantity will be calculated automatically.'}
              </p>
            </div>

            <ChipPicker 
              label="Preset Colors (max 5 combined with custom)" 
              options={COLOR_OPTIONS} 
              selected={form.colors as string[]} 
              onChange={v => {
                if (v.length + (form.customColors as any[]).length > 5) {
                   addToast('Maximum 5 colors allowed total', 'error');
                   return;
                }
                set('colors', v);
              }} 
            />
            
            <div className="mt-4">
              <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-2">Custom Colors</label>
              <div className="flex flex-col gap-2">
                {(form.customColors as any[]).map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border border-burgundy/20" style={{backgroundColor: c.hex}}></div>
                    <span className="text-sm font-body">{c.name} ({c.hex})</span>
                    <button type="button" onClick={() => {
                        const newCustom = [...(form.customColors as any[])];
                        newCustom.splice(i, 1);
                        set('customColors', newCustom);
                    }} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                  </div>
                ))}
                
                {(form.colors as string[]).length + (form.customColors as any[]).length < 5 && (
                  <button type="button" onClick={() => setShowCustomColorForm(true)} className="text-xs font-ui flex items-center gap-1 text-burgundy bg-burgundy/5 hover:bg-burgundy/10 w-max px-3 py-1.5 rounded-full mt-1">
                    <Plus size={12}/> Add Custom Color
                  </button>
                )}
              </div>
            </div>

            {form.inventoryMode === 'color' && (
              <div className="bg-ivory/50 p-4 rounded-xl border border-burgundy/10 mt-4">
                 <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-3">Color Inventory Quantities</label>
                 {mode === 'edit' && product?.inventoryMode !== 'color' && (
                   <p className="text-xs text-burgundy/60 mb-3 bg-burgundy/5 p-2 rounded border border-burgundy/10">
                     Your previous total stock was {product?.quantity || 0}. Enter the quantity available for each color. The new total will be calculated automatically.
                   </p>
                 )}
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                   {[...(form.colors as string[]), ...(form.customColors as any[]).map(c => c.name)].map(cName => (
                      <div key={cName}>
                        <label className="block text-[10px] text-burgundy/60 mb-1">{cName}</label>
                        <input 
                          type="number" min={0} 
                          value={(form.colorStock as Record<string,number>)[cName] ?? ''} 
                          onChange={e => {
                             set('colorStock', {
                               ...(form.colorStock as Record<string,number>),
                               [cName]: parseInt(e.target.value) || 0
                             });
                          }}
                          className={inp('colorStock')}
                          placeholder="0"
                        />
                      </div>
                   ))}
                 </div>
              </div>
            )}

            <div className="pt-2">
              <ChipPicker label="Tags (max 15)" options={TAG_OPTIONS} selected={form.tags as string[]} onChange={v => set('tags', v)} limit={15} />
            </div>
          </section>

          {/* Images */}
          <section>
            <div className="mb-4">
              <p className="text-xs font-ui font-semibold text-burgundy/40 uppercase tracking-widest mb-1">Images (max 10 · Drag to Reorder)</p>
              <p className="text-[10px] font-body text-burgundy/60 leading-tight">
                Click and drag an image to reorder it.
              </p>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="flex flex-wrap gap-3 mb-4">
                <SortableContext items={form.unifiedImages.map(img => img.id)} strategy={rectSortingStrategy}>
                  {form.unifiedImages.map(img => (
                    <SortableImageItem 
                      key={img.id} 
                      item={img} 
                      onRemove={removeImage}
                    />
                  ))}
                </SortableContext>
              </div>
            </DndContext>

            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-2 border-2 border-dashed border-burgundy/20 hover:border-burgundy/40 text-burgundy/60 hover:text-burgundy px-5 py-3 rounded-xl text-sm font-body transition-all"
            >
              <Upload size={16} />
              Upload images
            </button>
            <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/heic,image/heif" multiple className="hidden" onChange={e => handleImageFiles(e.target.files)} />
          </section>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2 border-t border-burgundy/10">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-burgundy/20 text-burgundy rounded-xl font-body text-sm hover:bg-rose-gold/10 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingState !== null}
              id="product-form-submit-btn"
              className="px-6 py-2.5 bg-burgundy text-white rounded-xl font-body text-sm font-medium hover:bg-burgundy/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {savingState !== null && <RefreshCw size={14} className="animate-spin" />}
              {savingState !== null ? savingState : mode === 'add' ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Custom Color Modal */}
      {showCustomColorForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" onClick={() => {
            setShowCustomColorForm(false);
            setCustomColorName('');
            setCustomColorHex('#1F8A5B');
            setCustomColorQuantity('0');
          }} />
          <div className="relative bg-[#FDFBF7] border border-burgundy/20 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-[440px] p-6 space-y-6">
            <div>
              <h3 className="text-xl font-heading font-bold text-burgundy">Add Custom Color</h3>
              <p className="text-xs text-burgundy/60 font-body mt-1">Create a custom color option for this product.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Color Name</label>
                <input type="text" value={customColorName} onChange={e => setCustomColorName(e.target.value)} placeholder="e.g. Emerald" autoFocus className="w-full px-3 py-2 border border-burgundy/20 rounded-xl text-sm font-body text-burgundy bg-white placeholder:text-burgundy/30 focus:outline-none focus:ring-2 focus:ring-burgundy/20" />
              </div>

              <div>
                <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Color Shade</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-burgundy/20 shadow-sm flex-shrink-0 cursor-pointer">
                    <input type="color" value={customColorHex} onChange={e => setCustomColorHex(e.target.value.toUpperCase())} className="absolute inset-[-10px] w-[60px] h-[60px] cursor-pointer" />
                  </div>
                  <input type="text" value={customColorHex} onChange={e => setCustomColorHex(e.target.value.toUpperCase())} placeholder="#1F8A5B" className="flex-1 px-3 py-2 border border-burgundy/20 rounded-xl text-sm font-body text-burgundy bg-white placeholder:text-burgundy/30 focus:outline-none focus:ring-2 focus:ring-burgundy/20 uppercase" />
                </div>
              </div>

              {form.inventoryMode === 'color' && (
                <div>
                  <label className="block text-xs font-ui font-semibold text-burgundy/70 uppercase tracking-wide mb-1">Quantity</label>
                  <input type="number" min="0" value={customColorQuantity} onChange={e => setCustomColorQuantity(e.target.value)} className="w-full px-3 py-2 border border-burgundy/20 rounded-xl text-sm font-body text-burgundy bg-white placeholder:text-burgundy/30 focus:outline-none focus:ring-2 focus:ring-burgundy/20" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => {
                setShowCustomColorForm(false);
                setCustomColorName('');
                setCustomColorHex('#1F8A5B');
                setCustomColorQuantity('0');
              }} className="px-5 py-2 text-sm font-body font-medium text-burgundy bg-ivory/50 hover:bg-rose-gold/20 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => {
                const name = customColorName.trim();
                if (!name) return addToast('Name required', 'error');
                if (name.length > 50) return addToast('Name too long', 'error');
                if (!/^#[0-9A-F]{6}$/i.test(customColorHex)) return addToast('Invalid HEX', 'error');
                
                const qty = parseInt(customColorQuantity, 10);
                if (form.inventoryMode === 'color' && (isNaN(qty) || qty < 0)) return addToast('Invalid quantity', 'error');

                const exists = (form.customColors as any[]).some(c => c.name.toLowerCase() === name.toLowerCase()) || (form.colors as string[]).some(c => c.toLowerCase() === name.toLowerCase());
                if (exists) return addToast('Color already exists', 'error');
                if ((form.colors as string[]).length + (form.customColors as any[]).length >= 5) return addToast('Max 5 colors', 'error');

                set('customColors', [...(form.customColors as any[]), { name, hex: customColorHex.toUpperCase() }]);
                if (form.inventoryMode === 'color') {
                  set('colorStock', { ...form.colorStock, [name]: qty });
                }

                setShowCustomColorForm(false);
                setCustomColorName('');
                setCustomColorHex('#1F8A5B');
                setCustomColorQuantity('0');
              }} className="px-5 py-2 text-sm font-body font-medium text-white bg-burgundy hover:bg-burgundy/90 rounded-xl transition-colors shadow-sm">
                Add Color
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sortable Image Item ────────────────────────────────────────────────────────

function SortableImageItem({
  item,
  onRemove,
}: {
  item: FormImage;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-burgundy/10 group bg-gray-100"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-10">
        <Image 
          src={item.previewUrl} 
          alt="product" 
          fill 
          className="object-cover pointer-events-none"
        />
      </div>

      {/* Drag Handle */}
      <div 
        className="absolute top-1 left-1 z-30 p-1 bg-white/90 rounded text-burgundy shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-white"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </div>

      {/* Remove Button */}
      <button 
        type="button" 
        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }} 
        className="absolute top-1 right-1 z-30 bg-red-500/90 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        <X size={14} />
      </button>
      
      {!item.isExisting && (
        <span className="absolute bottom-0 left-0 right-0 z-20 text-[10px] bg-emerald-500 text-white text-center font-ui py-0.5 pointer-events-none">NEW</span>
      )}
    </div>
  );
}

// ─── Badge Chip ───────────────────────────────────────────────────────────────

function BadgeChip({ badge }: { badge?: string }) {
  if (!badge) return null;
  const map: Record<string, string> = {
    'trending': 'bg-orange-100 text-orange-700',
    'best-seller': 'bg-emerald-100 text-emerald-700',
    'limited': 'bg-purple-100 text-purple-700',
    'new': 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-ui font-semibold uppercase tracking-wider ${map[badge] ?? 'bg-gray-100 text-gray-600'}`}>
      {badge.replace(/-/g, ' ')}
    </span>
  );
}

// ─── Main Page (Client) ──────────────────────────────────────────────────────

export default function ProductsClient({
  initialProducts,
  initialTotalItems,
  initialTotalPages,
  initialCategories,
}: {
  initialProducts: RawProduct[];
  initialTotalItems: number;
  initialTotalPages: number;
  initialCategories: RawCategory[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [filterBadge, setFilterBadge] = useState('All');
  const [filterStock, setFilterStock] = useState('All');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [editProduct, setEditProduct] = useState<RawProduct | undefined>();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: '', description: '', onConfirm: () => {},
  });

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));
  
  const queryClient = useQueryClient();

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterBadge, filterStock, filterCategory, rowsPerPage]);
          const initialAdminData = (currentPage === 1 && !debouncedSearch && filterStock === 'All' && filterBadge === 'All' && filterCategory === '')
    ? { products: initialProducts, totalItems: initialTotalItems, totalPages: initialTotalPages }
    : undefined;

  const { data, isPending, isFetching } = useAdminProducts({
    page: currentPage,
    perPage: rowsPerPage,
    search: debouncedSearch,
    categoryId: filterCategory,
    sort: '-id',
    inStock: filterStock,
    badge: filterBadge
  }, initialAdminData);

  const loading = isPending && !data;
  const isRefreshing = isFetching;

  const products = (data?.products as unknown as RawProduct[]) || initialProducts;
  const totalItems = data?.totalItems ?? initialTotalItems;
  const totalPages = data?.totalPages ?? initialTotalPages;

  const { data: categoriesData } = useAdminCategories({ success: true, categories: initialCategories });
  const categories = (categoriesData?.categories as unknown as RawCategory[]) || initialCategories;

  const { mutateAsync: deleteProduct } = useDeleteProduct();
  const { mutateAsync: deleteProducts } = useDeleteProducts();
  const { mutateAsync: duplicateProduct } = useDuplicateProduct();

  const fetchAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const filtered = products;

  const handleSelectAll = (checked: boolean) =>
    setSelectedIds(checked ? new Set(filtered.map(p => p.id)) : new Set());

  const handleSelectOne = (id: string, checked: boolean) =>
    setSelectedIds(prev => { const n = new Set(prev); checked ? n.add(id) : n.delete(id); return n; });

  const confirmDelete = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Product',
      description: `Delete "${name}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        
        const previousQueries = queryClient.getQueriesData({ queryKey: queryKeys.admin.products.all() });
        const previousSelection = new Set(selectedIds);
        
        // 1. Clear selection
        setSelectedIds(new Set());

        // 2. Optimistic update
        queryClient.setQueriesData({ queryKey: queryKeys.admin.products.all() }, (oldData: any) => {
          if (!oldData || !oldData.products) return oldData;
          const removedCount = oldData.products.some((p: any) => p.id === id) ? 1 : 0;
          return {
            ...oldData,
            products: oldData.products.filter((p: any) => p.id !== id),
            totalItems: Math.max(0, oldData.totalItems - removedCount)
          };
        });

        try {
          const res = await deleteProduct(id);
          if (res && res.success === false) {
             throw new Error(res.error || 'Failed to delete product');
          }
          // 3. targeted reconciliation
          queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all() });
          addToast('Product deleted', 'success');
        } catch (err: any) {
          // 4. Rollback
          previousQueries.forEach(([queryKey, oldData]) => {
            queryClient.setQueryData(queryKey, oldData);
          });
          setSelectedIds(previousSelection);
          addToast(err.message || 'Failed to delete product', 'error');
        }
      },
    });
  };

  const confirmBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Products',
      description: `Delete ${selectedIds.size} selected product(s)? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        
        const idsToDelete = new Set(selectedIds);
        const previousQueries = queryClient.getQueriesData({ queryKey: queryKeys.admin.products.all() });
        const previousSelection = new Set(selectedIds);
        
        // 1. Clear selection
        setSelectedIds(new Set());

        // 2. Optimistic update
        queryClient.setQueriesData({ queryKey: queryKeys.admin.products.all() }, (oldData: any) => {
          if (!oldData || !oldData.products) return oldData;
          const removedCount = oldData.products.filter((p: any) => idsToDelete.has(p.id)).length;
          return {
            ...oldData,
            products: oldData.products.filter((p: any) => !idsToDelete.has(p.id)),
            totalItems: Math.max(0, oldData.totalItems - removedCount)
          };
        });

        try {
          const res = await deleteProducts(Array.from(idsToDelete));
          if (res && res.success === false) {
             throw new Error(res.error || 'Failed to delete products');
          }
          // 3. targeted reconciliation
          queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all() });
          addToast('Products deleted', 'success');
        } catch (err: any) {
          // 4. Rollback
          previousQueries.forEach(([queryKey, oldData]) => {
            queryClient.setQueryData(queryKey, oldData);
          });
          setSelectedIds(previousSelection);
          addToast(err.message || 'Failed to delete products', 'error');
        }
      },
    });
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateProduct(id);
      addToast('Product duplicated', 'success');
    } catch {
      addToast('Failed to duplicate product', 'error');
    }
  };

  const handleSaved = (saved: RawProduct, mode: 'add' | 'edit') => {
    if (mode === 'edit') {
      queryClient.setQueriesData({ queryKey: queryKeys.admin.products.all() }, (old: any) => {
        if (!old || !old.products) return old;
        return {
          ...old,
          products: old.products.map((p: any) => p.id === saved.id ? { ...p, ...saved } : p)
        };
      });
    } else {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.products.all(),
        refetchType: 'active',
      });
    }
    setFormMode(null);
    setEditProduct(undefined);
  };

  const categoryName = (id?: string) =>
    !id ? '—' : (categories.find(c => c.id === id)?.name ?? '—');

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-burgundy">Products</h1>
          <p className="text-burgundy/60 font-body text-sm mt-1">
            Manage your jewelry catalog — {products.length} product{products.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          id="add-product-btn"
          onClick={() => { setEditProduct(undefined); setFormMode('add'); }}
          className="flex items-center gap-2 bg-burgundy text-white px-5 py-2.5 rounded-full font-body text-sm font-medium hover:bg-burgundy/90 transition-colors shadow-md shadow-burgundy/20 self-start sm:self-auto"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-burgundy/5 flex flex-col sm:flex-row justify-between gap-4 bg-ivory/30">
          <div className="flex items-center gap-2 bg-white border border-burgundy/10 rounded-xl px-4 py-2 w-full sm:w-80 focus-within:border-burgundy/30 transition-colors">
            <Search size={16} className="text-burgundy/40 flex-shrink-0" />
            <input
              aria-label="Search products"
              type="text"
              placeholder="Search by name, code…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-burgundy placeholder:text-burgundy/40 w-full font-body"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={fetchAll}
              disabled={isRefreshing}
              className="px-3 py-2 text-burgundy/60 hover:text-burgundy hover:bg-burgundy/5 rounded-full transition-colors flex items-center gap-2 text-sm font-body disabled:opacity-50"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>

            {selectedIds.size > 0 && (
              <button
                onClick={confirmBulkDelete}
                className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-full text-sm font-body hover:bg-red-100 transition-colors"
              >
                <Trash2 size={15} />
                Delete ({selectedIds.size})
              </button>
            )}

            {/* Badge filter */}
            <div className="relative">
              <select
                aria-label="Filter by badge"
                value={filterBadge}
                onChange={e => setFilterBadge(e.target.value)}
                className="appearance-none bg-white border border-burgundy/10 text-burgundy text-sm rounded-full px-4 py-2 pr-8 font-body outline-none focus:border-burgundy/30 cursor-pointer"
              >
                <option value="All">All Badges</option>
                {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-burgundy/40 pointer-events-none" />
            </div>

            {/* Category filter */}
            <div className="relative">
              <select
                aria-label="Filter by category"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="appearance-none bg-white border border-burgundy/10 text-burgundy text-sm rounded-full px-4 py-2 pr-8 font-body outline-none focus:border-burgundy/30 cursor-pointer max-w-[150px] truncate"
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-burgundy/40 pointer-events-none" />
            </div>

            {/* Stock filter */}
            <div className="relative">
              <select
                aria-label="Filter by stock"
                value={filterStock}
                onChange={e => setFilterStock(e.target.value)}
                className="appearance-none bg-white border border-burgundy/10 text-burgundy text-sm rounded-full px-4 py-2 pr-8 font-body outline-none focus:border-burgundy/30 cursor-pointer"
              >
                <option value="All">All Stock</option>
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-burgundy/40 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-burgundy/5 bg-ivory/20">
                <th className="pl-5 py-3 w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all products"
                    checked={filtered.length > 0 && filtered.every(p => selectedIds.has(p.id))}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 accent-burgundy rounded cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-ui font-semibold text-burgundy/50 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-center text-xs font-ui font-semibold text-burgundy/50 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-center text-xs font-ui font-semibold text-burgundy/50 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-center text-xs font-ui font-semibold text-burgundy/50 uppercase tracking-wider">Rating</th>
                <th className="px-4 py-3 text-center text-xs font-ui font-semibold text-burgundy/50 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-center text-xs font-ui font-semibold text-burgundy/50 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-center text-xs font-ui font-semibold text-burgundy/50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-burgundy/5">
                    <td className="pl-5 py-4"><div className="w-4 h-4 rounded bg-burgundy/10 animate-pulse" /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-burgundy/10 animate-pulse flex-shrink-0" />
                        <div className="space-y-2">
                          <div className="h-3 w-32 rounded bg-burgundy/10 animate-pulse" />
                          <div className="h-2 w-20 rounded bg-burgundy/5 animate-pulse" />
                        </div>
                      </div>
                    </td>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-3 w-16 rounded bg-burgundy/10 animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-20 text-burgundy/40 font-body text-sm">
                    <Package size={40} className="mx-auto mb-3 opacity-30" />
                    {searchQuery || filterBadge !== 'All' || filterStock !== 'All'
                      ? 'No products match your filters.'
                      : 'No products yet. Click "Add Product" to get started.'}
                  </td>
                </tr>
              ) : (
                filtered.map(product => {
                  const thumbImg = product.images?.[0]
                    ? buildImageUrl(product.collectionId, product.id, product.images[0])
                    : null;
                  return (
                    <tr
                      key={product.id}
                      className={`border-b border-burgundy/5 hover:bg-rose-gold/5 transition-colors group ${selectedIds.has(product.id) ? 'bg-burgundy/[0.03]' : ''}`}
                    >
                      <td className="pl-5 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${product.name}`}
                          checked={selectedIds.has(product.id)}
                          onChange={e => handleSelectOne(product.id, e.target.checked)}
                          className="w-4 h-4 accent-burgundy rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-burgundy/10 bg-ivory flex-shrink-0">
                            {thumbImg ? (
                              <Image src={thumbImg} alt={product.name} width={48} height={48} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon size={18} className="text-burgundy/20" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-body font-medium text-burgundy line-clamp-1 max-w-[180px]">{product.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {product.productCode && <span className="text-[11px] text-burgundy/40 font-mono">{product.productCode}</span>}
                              <BadgeChip badge={product.badge} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-body text-burgundy/70">{categoryName(product.category)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div>
                          <p className="text-sm font-body font-semibold text-burgundy">{formatPrice(product.price)}</p>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <p className="text-[11px] text-burgundy/40 line-through">{formatPrice(product.originalPrice)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {product.rating ? (
                          <div className="flex items-center justify-center gap-1">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-sm font-body text-burgundy/80">{product.rating.toFixed(1)}</span>
                            {product.reviewCount ? <span className="text-[11px] text-burgundy/40">({product.reviewCount})</span> : null}
                          </div>
                        ) : <span className="text-sm text-burgundy/30">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-ui font-semibold ${
                          (product.quantity ?? 0) > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${(product.quantity ?? 0) > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {(product.quantity ?? 0) > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-ui font-semibold text-burgundy">{product.quantity ?? 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1 transition-opacity">
                          <button
                            title="Edit"
                            id={`edit-product-${product.id}`}
                            onClick={() => { setEditProduct(product); setFormMode('edit'); }}
                            className="p-2 text-burgundy/50 hover:text-burgundy hover:bg-rose-gold/10 rounded-lg transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            title="Duplicate"
                            id={`duplicate-product-${product.id}`}
                            onClick={() => handleDuplicate(product.id)}
                            className="p-2 text-burgundy/50 hover:text-burgundy hover:bg-rose-gold/10 rounded-lg transition-colors"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            title="Delete"
                            id={`delete-product-${product.id}`}
                            onClick={() => confirmDelete(product.id, product.name)}
                            className="p-2 text-burgundy/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        {!loading && (
          <ProductsPagination 
            rowsPerPage={rowsPerPage} 
            setRowsPerPage={setRowsPerPage} 
            setCurrentPage={setCurrentPage} 
            currentPage={currentPage} 
            totalPages={totalPages} 
            handlePageChange={(p: number) => setCurrentPage(p)} 
            totalItems={totalItems} 
            selectedCount={selectedIds.size}
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      {formMode && (
        <ProductFormModal
          mode={formMode}
          product={editProduct}
          categories={categories}
          onClose={() => { setFormMode(null); setEditProduct(undefined); }}
          onSaved={handleSaved}
          addToast={addToast}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        variant="danger"
        confirmText="Delete"
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} remove={removeToast} />
    </div>
  );
}
