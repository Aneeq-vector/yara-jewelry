'use client';

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
import {
  getProductsAction,
  getCategoriesAction,
  deleteProductAction,
  deleteProductsAction,
  duplicateProductAction,
  revalidateProductsAction,
  getAdminTokenAction,
} from '@/app/actions/products';
import { PB_URL } from '@/lib/pocketbase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RawCategory {
  id: string;
  name: string;
  slug: string;
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
  tags?: string[];
  created: string;
  updated: string;
  expand?: { category?: RawCategory };
}

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; message: string; type: ToastType }

const BADGE_OPTIONS = ['trending', 'best-seller', 'limited', 'new'];
const COLOR_OPTIONS = ['Gold', 'Silver', 'Rose Gold', 'Platinum', 'Black'];
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

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
    set('unifiedImages', form.unifiedImages.filter(img => img.id !== id));
  };

  const updateImagePosition = (id: string, position: string) => {
    set('unifiedImages', form.unifiedImages.map(img => 
      img.id === id ? { ...img, position } : img
    ));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.toString().trim()) errs.name = 'Name is required';
    if (!form.price || isNaN(Number(form.price))) errs.price = 'Valid price is required';
    if (!form.shortDescription.toString().trim()) errs.shortDescription = 'Short description is required';
    if (!form.description.toString().trim()) errs.description = 'Description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

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
      if (form.quantity) fd.append('quantity', form.quantity.toString());
      fd.append('inStock', (form.inStock as boolean) ? 'true' : 'false');
      // Colors & tags — PocketBase accepts repeated keys for arrays
      (form.colors as string[]).forEach(c => fd.append('colors', c));
      (form.tags as string[]).forEach(t => fd.append('tags', t));

      // Extract positions in the EXACT order of unifiedImages
      const positionsArray = form.unifiedImages.map(img => img.position);
      fd.append('imagePositions', JSON.stringify(positionsArray));

      // Compress images before upload to ensure lightning-fast saves
      const options = {
        maxSizeMB: 1, // Max size 1MB per image
        maxWidthOrHeight: 1920, // Max 1920px width/height
        useWebWorker: true,
      };

      // We append images one by one in order. 
      // For updates, sending the entire 'images' array replaces the old one and preserves this exact order!
      for (const item of form.unifiedImages) {
        if (item.isExisting && item.filename) {
          // Existing image
          fd.append('images', item.filename);
        } else if (item.file) {
          // New image
          try {
            const compressed = await imageCompression(item.file, options);
            fd.append('images', compressed, compressed.name || item.file.name);
          } catch (error) {
            console.error('Image compression failed for', item.file.name, error);
            fd.append('images', item.file, item.file.name);
          }
        }
      }

      // Step 1: Get admin token from server action
      const tokenRes = await getAdminTokenAction();
      if (!tokenRes?.token || !tokenRes?.pbUrl) {
        throw new Error(tokenRes?.error || 'Could not get upload credentials');
      }

      // Step 2: Upload DIRECTLY to the remote PocketBase server from the browser!
      // We must bypass Next.js API Routes and Rewrites entirely because Vercel
      // imposes a strict 4.5MB limit on all requests passing through its infrastructure.
      // Since we fixed the Nginx 1MB limit on the remote server, this will now work seamlessly.
      const proxyUrl =
        mode === 'add'
          ? `${tokenRes.pbUrl}/api/collections/products/records`
          : `${tokenRes.pbUrl}/api/collections/products/records/${product!.id}`;
      const method = mode === 'add' ? 'POST' : 'PATCH';

      const response = await fetch(proxyUrl, {
        method,
        headers: {
          Authorization: `Bearer ${tokenRes.token}`,
        },
        body: fd,
      });

      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('Non-JSON response from rewrite:', text.substring(0, 500));
        throw new Error(`Server returned an invalid response. Status: ${response.status}`);
      }

      if (!response.ok) {
        const details = data?.data
          ? Object.entries(data.data).map(([k, v]: any) => `${k}: ${v?.message}`).join(', ')
          : '';
        throw new Error(data?.message || data?.error || `HTTP ${response.status}${details ? ` (${details})` : ''}`);
      }

      // Revalidate Next.js cache in the background (don't block UI)
      revalidateProductsAction().catch(console.error);
      res = { success: true, product: data };

    } catch (err: any) {
      console.error('Product save error:', err);
      res = { error: err.message || 'Failed to save product' };
    }

    setSaving(false);
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
                <input aria-label="Quantity" type="number" min={0} step="1" placeholder="0" value={form.quantity.toString()} onChange={e => set('quantity', e.target.value)} className={inp('quantity')} />
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
                <textarea aria-label="Full description" rows={4} placeholder="Full product description (HTML supported)" value={form.description.toString()} onChange={e => set('description', e.target.value)} className={`${inp('description')} resize-none`} />
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
                onClick={() => set('inStock', !(form.inStock as boolean))}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${(form.inStock as boolean) ? 'bg-emerald-500' : 'bg-burgundy/20'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${(form.inStock as boolean) ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm font-body text-burgundy cursor-pointer" onClick={() => set('inStock', !(form.inStock as boolean))}>
                {(form.inStock as boolean) ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </section>

          {/* Colors & Tags */}
          <section className="space-y-4">
            <ChipPicker label="Colors (max 5)" options={COLOR_OPTIONS} selected={form.colors as string[]} onChange={v => set('colors', v)} limit={5} />
            <ChipPicker label="Tags (max 15)" options={TAG_OPTIONS} selected={form.tags as string[]} onChange={v => set('tags', v)} limit={15} />
          </section>

          {/* Images */}
          <section>
            <div className="mb-4">
              <p className="text-xs font-ui font-semibold text-burgundy/40 uppercase tracking-widest mb-1">Images (max 10 · Drag to Reorder)</p>
              <p className="text-[10px] font-body text-burgundy/60 leading-tight">
                Click and drag an image to reorder it. <br/>
                Click the crosshair anywhere on the image to set the focal point (crop position) for the storefront!
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
                      onPositionChange={updateImagePosition} 
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
              disabled={saving}
              id="product-form-submit-btn"
              className="px-6 py-2.5 bg-burgundy text-white rounded-xl font-body text-sm font-medium hover:bg-burgundy/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <RefreshCw size={14} className="animate-spin" />}
              {saving ? 'Saving…' : mode === 'add' ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sortable Image Item ────────────────────────────────────────────────────────

function SortableImageItem({
  item,
  onRemove,
  onPositionChange,
}: {
  item: FormImage;
  onRemove: (id: string) => void;
  onPositionChange: (id: string, pos: string) => void;
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

  const handleDragFocal = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    onPositionChange(item.id, `${Math.round(x)}% ${Math.round(y)}%`);
  };

  const [posX, posY] = item.position.split(' ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-burgundy/10 group bg-gray-100"
    >
      {/* Background Image that you can click to set focal point */}
      <div 
        className="absolute inset-0 z-10 cursor-crosshair" 
        onMouseDown={handleDragFocal}
      >
        <Image 
          src={item.previewUrl} 
          alt="product" 
          fill 
          className="object-cover pointer-events-none"
        />
        
        {/* Crosshair indicator */}
        <div 
          className="absolute w-4 h-4 -ml-2 -mt-2 border-2 border-white rounded-full shadow-[0_0_4px_rgba(0,0,0,0.5)] pointer-events-none transition-all"
          style={{ left: posX, top: posY }}
        >
          <div className="absolute top-1/2 left-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 bg-rose-500 rounded-full" />
        </div>
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
  const [products, setProducts] = useState<RawProduct[]>(initialProducts);
  const [categories, setCategories] = useState<RawCategory[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBadge, setFilterBadge] = useState('All');
  const [filterStock, setFilterStock] = useState('All');
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

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  
  // Debounced search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, filterBadge, filterStock, currentPage, rowsPerPage]);

  const fetchData = async () => {
    setLoading(true);
    const res = await getProductsAction(currentPage, rowsPerPage, searchQuery, '', '-id', filterStock, filterBadge);
    if (res.success && res.products) {
      setProducts(res.products as unknown as RawProduct[]);
      setTotalItems(res.totalItems || 0);
      setTotalPages(res.totalPages || 0);
    }
    setLoading(false);
  };

  const fetchAll = useCallback(async () => {
    fetchData();
    setSelectedIds(new Set());
  }, [currentPage, rowsPerPage, searchQuery, filterBadge, filterStock]);

  const filtered = products; // Already filtered by the server

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
        setProducts(prev => prev.filter(p => p.id !== id));
        const res = await deleteProductAction(id);
        if (!res.success) { fetchAll(); addToast('Failed to delete product', 'error'); }
        else addToast('Product deleted', 'success');
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
        const ids = Array.from(selectedIds);
        setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
        setSelectedIds(new Set());
        const res = await deleteProductsAction(ids);
        if (!res.success) { fetchAll(); addToast('Failed to delete some products', 'error'); }
        else addToast(`${ids.length} product(s) deleted`, 'success');
      },
    });
  };

  const handleDuplicate = async (id: string) => {
    const res = await duplicateProductAction(id);
    if (res.success && res.product) {
      setProducts(prev => [res.product as unknown as RawProduct, ...prev]);
      addToast('Product duplicated', 'success');
    } else {
      addToast(res.error || 'Failed to duplicate', 'error');
    }
  };

  const handleSaved = (_saved: RawProduct, mode: 'add' | 'edit') => {
    // 1. Optimistic UI Update: instantly update the local state so the user sees no delay!
    if (mode === 'add') {
      setProducts(prev => [_saved, ...prev]);
    } else {
      setProducts(prev => prev.map(p => p.id === _saved.id ? _saved : p));
    }
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
              disabled={loading}
              className="px-3 py-2 text-burgundy/60 hover:text-burgundy hover:bg-burgundy/5 rounded-full transition-colors flex items-center gap-2 text-sm font-body disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
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
                          product.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
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

        {/* Footer count */}
        {!loading && products.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-sm text-burgundy/60 font-body">
            <span>Showing {(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, totalItems)} of {totalItems} products (Page {currentPage} of {totalPages})</span>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && <span className="mr-4">{selectedIds.size} selected</span>}
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-burgundy/10 hover:bg-burgundy/5 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-burgundy/10 hover:bg-burgundy/5 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
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
