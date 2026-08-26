'use client';

import { useState, useEffect, useMemo, useRef, useReducer } from 'react';
import { m as motion, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Gift,
  Save,
  Upload,
  Check,
  Search,
  ImageIcon,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  Loader,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { createClient, PB_URL } from '@/lib/pocketbase';
import { getAllCategories } from '@/lib/data/categories';
import { getAllGiftBoxes } from '@/lib/data/gift-boxes';
import { updateGiftBoxAction } from '@/app/actions/update-gift-box';
import { Product, Category, GiftBox } from '@/types';
import { useProductOptions } from '@/lib/hooks/use-products';
import { useAdminGiftBoxes } from '@/lib/hooks/use-gift-boxes';
import { useAdminCategories } from '@/lib/hooks/use-admin-products';

// ─── Types ───────────────────────────────────────────────────────────────────
interface RawBox {
  id: string;
  name: string;
  type: string;
  slug: string;
  description: string;
  box_price: number;
  images: string[];
  imageFiles: string[]; // raw filenames
  fixed_items: string[];
  category: string;
  is_active: boolean;
  collectionId: string;
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildImageUrl(collectionId: string, recordId: string, filename: string) {
  if (!filename) return '/placeholder.png';
  if (filename.startsWith('http')) return filename;
  return `${PB_URL}/api/files/${collectionId}/${recordId}/${filename}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface EditorState {
  editorCategory: string;
  selectedItems: Set<string>;
  productSearch: string;
  isActive: boolean;
  pendingImage: File | null;
  previewUrl: string;
  saveStatus: SaveStatus;
}

type EditorAction =
  | { type: 'LOAD_BOX'; payload: RawBox }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'TOGGLE_ITEM'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'TOGGLE_ACTIVE' }
  | { type: 'SET_IMAGE'; payload: { file: File | null; previewUrl: string } }
  | { type: 'SET_SAVE_STATUS'; payload: SaveStatus }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'CLEAR_ITEMS' };

const initialEditorState: EditorState = {
  editorCategory: '',
  selectedItems: new Set(),
  productSearch: '',
  isActive: true,
  pendingImage: null,
  previewUrl: '',
  saveStatus: 'idle',
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'LOAD_BOX':
      return {
        ...state,
        editorCategory: '',
        selectedItems: new Set(action.payload.fixed_items),
        isActive: action.payload.is_active,
        pendingImage: null,
        previewUrl: action.payload.images[0] || '',
        saveStatus: 'idle',
        productSearch: '',
      };
    case 'SET_CATEGORY':
      return { ...state, editorCategory: action.payload, productSearch: '' };
    case 'TOGGLE_ITEM': {
      const next = new Set(state.selectedItems);
      if (next.has(action.payload)) next.delete(action.payload);
      else next.add(action.payload);
      return { ...state, selectedItems: next };
    }
    case 'SET_SEARCH':
      return { ...state, productSearch: action.payload };
    case 'TOGGLE_ACTIVE':
      return { ...state, isActive: !state.isActive };
    case 'SET_IMAGE':
      return { ...state, pendingImage: action.payload.file, previewUrl: action.payload.previewUrl };
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };
    case 'SAVE_SUCCESS':
      return { ...state, pendingImage: null, saveStatus: 'success' };
    case 'CLEAR_ITEMS':
      return { ...state, selectedItems: new Set() };
    default:
      return state;
  }
}



function GiftBoxEditor({
  selectedBox, isActive, previewUrl, fileInputRef, handleImageChange, pendingImage,
  editorCategory, categories, productSearch, filteredProducts, selectedItems, toggleItem,
  saveStatus, handleSave, dispatch
}: any) {
  return (
        <div className="lg:col-span-2">
          {!selectedBox ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 rounded-3xl border border-dashed border-nude/60 bg-champagne/10">
              <Gift size={40} className="text-burgundy/20 mb-3" />
              <p className="font-body text-sm text-burgundy/40">
                Select a gift box on the left to edit it
              </p>
            </div>
          ) : (
            <motion.div
              key={selectedBox.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* ─ Box name + status ─ */}
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold text-burgundy">
                  {selectedBox.name}
                </h2>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_ACTIVE' })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-ui text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-500 border border-red-200'
                  }`}
                >
                  {isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* ─ Image upload ─ */}
              <div className="bg-white rounded-2xl border border-nude/40 p-5">
                <p className="font-ui font-bold text-xs uppercase tracking-wider text-burgundy/40 mb-4">
                  Box Image
                </p>
                <div className="flex items-start gap-5">
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-champagne/40 flex-shrink-0 border border-nude/40">
                    {previewUrl ? (
                      <Image src={previewUrl} alt="preview" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" unoptimized />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon size={24} className="text-burgundy/20" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-body text-sm text-burgundy/60 mb-3">
                      Upload a photo for this gift box. It will appear on the gift boxes page and the box detail page.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-champagne border border-nude/60 font-ui text-sm text-burgundy font-semibold hover:bg-champagne/80 transition-colors"
                    >
                      <Upload size={14} />
                      {pendingImage ? 'Change Image' : 'Upload Image'}
                    </button>
                    {pendingImage && (
                      <p className="font-body text-xs text-burgundy/50 mt-2 flex items-center gap-1">
                        <Check size={12} className="text-emerald-500" />
                        {pendingImage.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ─ Category picker ─ */}
              <div className="bg-white rounded-2xl border border-nude/40 p-5">
                <p className="font-ui font-bold text-xs uppercase tracking-wider text-burgundy/40 mb-4">
                  Filter Products by Category
                </p>
                <p className="font-body text-xs text-burgundy/50 mb-3">
                  Select a category to narrow down the product list below. The products you tick will be included in this gift box.
                </p>
                <div className="relative">
                  <select
                    aria-label="Category Filter"
                    value={editorCategory}
                    onChange={(e) => {
                      dispatch({ type: 'SET_CATEGORY', payload: e.target.value });
                    }}
                    className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl border border-nude/60 bg-champagne/20 font-body text-sm text-burgundy focus:outline-none focus:border-burgundy/40 transition-colors"
                  >
                    <option value="">— Show all categories —</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-burgundy/40 pointer-events-none"
                  />
                </div>
              </div>

              {/* ─ Product picker ─ */}
              <div className="bg-white rounded-2xl border border-nude/40 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-ui font-bold text-xs uppercase tracking-wider text-burgundy/40">
                    Fixed Items
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-burgundy text-ivory text-[10px]">
                      {selectedItems.size} selected
                    </span>
                  </p>
                  {selectedItems.size > 0 && (
                    <button
                      onClick={() => dispatch({ type: 'CLEAR_ITEMS' })}
                      className="font-body text-xs text-burgundy/40 hover:text-burgundy underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-burgundy/30" />
                  <input
                    aria-label="Search Products"
                    type="text"
                    value={productSearch}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-nude/60 bg-champagne/20 font-body text-sm text-burgundy placeholder:text-burgundy/30 focus:outline-none focus:border-burgundy/30"
                  />
                </div>

                {/* Product grid */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-10 text-burgundy/30 font-body text-sm">
                    {editorCategory
                      ? 'No products in this category'
                      : 'Select a category or search above'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
                    {filteredProducts.map((p: any) => {
                      const checked = selectedItems.has(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => toggleItem(p.id)}
                          className={`relative text-left rounded-xl overflow-hidden border-2 transition-all ${
                            checked
                              ? 'border-burgundy shadow-md shadow-burgundy/10'
                              : 'border-transparent hover:border-nude/60'
                          }`}
                        >
                          <div className="relative aspect-square bg-champagne/30">
                            <Image
                              src={p.images[0] || '/placeholder.png'}
                              alt={p.name || 'Product Image'}
                              fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover"
                              unoptimized
                            />
                            {checked && (
                              <div className="absolute inset-0 bg-burgundy/20 flex items-center justify-center">
                                <div className="w-7 h-7 rounded-full bg-burgundy flex items-center justify-center shadow-lg">
                                  <Check size={14} className="text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="font-ui text-[11px] font-semibold text-burgundy line-clamp-1">
                              {p.name}
                            </p>
                            <p className="font-body text-[10px] text-burgundy/50">
                              Rs. {(p.price || 0).toLocaleString()}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ─ Save button ─ */}
              <div className="flex items-center gap-4">
                <div>
                  {saveStatus === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-ui font-semibold"
                    >
                      <CheckCircle2 size={16} />
                      Saved successfully!
                    </motion.div>
                  ) : saveStatus === 'error' ? (
                    <motion.div
                      key="error"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-ui font-semibold"
                    >
                      <AlertCircle size={16} />
                      Error saving. Try again.
                    </motion.div>
                  ) : (
                    <motion.button
                      key="save"
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSave}
                      disabled={saveStatus === 'saving'}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-burgundy text-white font-ui font-semibold hover:bg-wine transition-colors shadow-md shadow-burgundy/20 disabled:opacity-60"
                    >
                      {saveStatus === 'saving' ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      {saveStatus === 'saving' ? 'Saving…' : 'Save Changes'}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

  );
}
function GiftBoxSelector({ boxes, selectedBoxId, setSelectedBoxId }: any) {
  return (
        <div className="space-y-3">
          <p className="font-ui font-bold text-xs uppercase tracking-wider text-burgundy/40">
            Select Box to Edit
          </p>
          {boxes.map((box: any) => (
            <button
              key={box.id}
              onClick={() => setSelectedBoxId(box.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                selectedBoxId === box.id
                  ? 'border-burgundy bg-burgundy/5 shadow-md'
                  : 'border-nude/40 bg-white hover:border-burgundy/30'
              }`}
            >
              <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-champagne/50">
                {box.images && box.images.length > 0 ? (
                  <Image
                    src={box.images[0]}
                    alt={box.name}
                    fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon size={20} className="text-burgundy/20" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-ui font-semibold text-sm text-burgundy truncate">{box.name}</p>
                <p className="font-body text-xs text-burgundy/50 capitalize">{box.type}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      box.is_active ? 'bg-emerald-500' : 'bg-red-400'
                    }`}
                  />
                  <span className="font-body text-[10px] text-burgundy/40">
                    {box.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

  );
}
export default function GiftBoxesAdminClient({ 
  initialBoxes,
  initialCategories,
  initialAllProducts
}: {
  initialBoxes: RawBox[];
  initialCategories: Category[];
  initialAllProducts: Product[];
}) {

  const { data: currentBoxes = initialBoxes, isPending: boxesLoading, refetch: refetchBoxes } = useAdminGiftBoxes(initialBoxes);
  const boxes = currentBoxes as RawBox[];
  const { data: categories = initialCategories } = useAdminCategories(initialCategories);
  const [allProducts, setAllProducts] = useState<Product[]>(initialAllProducts);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  // Editor state
  const [editorState, dispatch] = useReducer(editorReducer, initialEditorState);
  const { editorCategory, selectedItems, productSearch, isActive, pendingImage, previewUrl, saveStatus } = editorState;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: rawProducts = [] } = useProductOptions(initialAllProducts);

  useEffect(() => {
    if (!rawProducts.length) return;
    const products: Product[] = rawProducts.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      price: r.price,
      originalPrice: r.originalPrice,
      description: r.description,
      shortDescription: r.shortDescription,
      category: r.category as any,
      images: (r.images || []).map((fn: string) =>
        fn.startsWith('http') ? fn : `${PB_URL}/api/files/${r.collectionId}/${r.id}/${fn}`
      ),
      badge: r.badge || undefined,
      rating: r.rating || 0,
      reviewCount: r.reviewCount || 0,
      material: r.material || '',
      weight: r.weight || '',
      inStock: r.inStock ?? true, quantity: r.quantity ?? 0,
      colors: r.colors || [],
      tags: r.tags || [],
    }));
    setAllProducts(products);
  }, [rawProducts]);

  const selectedBox = boxes.find((b) => b.id === selectedBoxId) || null;

  // When a box is selected, load its state into the editor
  useEffect(() => {
    if (!selectedBox) return;
    dispatch({ type: 'LOAD_BOX', payload: selectedBox });
  }, [selectedBox]);

  // Products filtered by the chosen editor category + search
  const filteredProducts = useMemo(() => {
    let list = allProducts.filter(
      (p) => p.category !== 'gift-boxes' && !String(p.category).includes('gift')
    );
    if (editorCategory) {
      list = list.filter((p) => String(p.category) === editorCategory);
    }
    if (productSearch) {
      const q = productSearch.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [editorCategory, productSearch, allProducts]);

  const toggleItem = (id: string) => {
    dispatch({ type: 'TOGGLE_ITEM', payload: id });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch({ type: 'SET_IMAGE', payload: { file, previewUrl: URL.createObjectURL(file) } });
  };

  const handleSave = async () => {
    if (!selectedBox) return;
    dispatch({ type: 'SET_SAVE_STATUS', payload: 'saving' });
    try {
      const formData = new FormData();

      if (pendingImage) {
        formData.append('images', pendingImage);
      }
      if (editorCategory) {
        formData.append('category', editorCategory);
      } else {
        formData.append('category', '');
      }
      formData.append('is_active', String(isActive));

      const itemsArray = Array.from(selectedItems);
      itemsArray.forEach((item) => {
        formData.append('fixed_items', item);
      });

      const res = await updateGiftBoxAction(selectedBox.id, formData);
      
      if (res.error) {
        throw new Error(res.error);
      }

      const updated = res.giftBox;
      if (!updated) throw new Error("Failed to update gift box: No data returned.");


      dispatch({ type: 'SAVE_SUCCESS' });
      setTimeout(() => dispatch({ type: 'SET_SAVE_STATUS', payload: 'idle' }), 3000);
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SET_SAVE_STATUS', payload: 'error' });
      setTimeout(() => dispatch({ type: 'SET_SAVE_STATUS', payload: 'idle' }), 4000);
    }
  };


  return (
    <LazyMotion features={domAnimation}>
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-burgundy flex items-center gap-2">
            <Gift size={22} /> Gift Boxes
          </h1>
          <p className="text-burgundy/60 font-body text-sm mt-1">
            Manage box images, select category, pick products and control visibility.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchBoxes()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-burgundy/60 bg-white border border-nude/40 rounded-lg hover:bg-champagne/30 transition-colors"
          >
            <RefreshCw size={14} className={boxesLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left: Box selector ─────────────────────────────────────── */}
        <GiftBoxSelector boxes={boxes} selectedBoxId={selectedBoxId} setSelectedBoxId={setSelectedBoxId} />

        {/* ── Right: Editor ──────────────────────────────────────────── */}
        <GiftBoxEditor 
          selectedBox={selectedBox} isActive={isActive} previewUrl={previewUrl}
          fileInputRef={fileInputRef} handleImageChange={handleImageChange} pendingImage={pendingImage}
          editorCategory={editorCategory} categories={categories} productSearch={productSearch}
          filteredProducts={filteredProducts} selectedItems={selectedItems} toggleItem={toggleItem}
          saveStatus={saveStatus} handleSave={handleSave} dispatch={dispatch}
        />
      </div>
    </div>
    </LazyMotion>
  );
}
