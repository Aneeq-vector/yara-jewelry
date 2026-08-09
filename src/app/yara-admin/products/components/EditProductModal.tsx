import React from 'react';
import { X, ChevronDown, Upload, Save } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Product, Category } from '@/types';
import { EditProductImages } from './EditProductImages';
import { EditProductBadge } from './EditProductBadge';

interface EditProductModalProps {
  editingProduct: Product;
  setEditingProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  categories: {id: string, name: string}[];
  isSaving: boolean;
  handleSave: () => void;
  newImagePreviews: string[];
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeNewImage: (index: number) => void;
  removeExistingImage: (imgUrl: string, index: number) => void;
}

export function EditProductModal({
  editingProduct,
  setEditingProduct,
  categories,
  isSaving,
  handleSave,
  newImagePreviews,
  handleImageChange,
  removeNewImage,
  removeExistingImage,
}: EditProductModalProps) {
  return (
    <div className="fixed inset-0 bg-burgundy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-xl border border-burgundy/10 flex flex-col max-h-[90vh]">
        <div className="p-6 flex justify-between items-center border-b border-burgundy/10 shrink-0">
          <h2 className="font-heading font-bold text-xl text-burgundy">Edit Product: {editingProduct.productCode}</h2>
          <button onClick={() => setEditingProduct(null)} aria-label="Close Edit Product Modal" className="text-burgundy/50 hover:text-burgundy p-2 rounded-full hover:bg-champagne/50 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="product-name" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Product Name</label>
              <input 
                id="product-name"
                type="text" 
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
              />
            </div>
            <div>
              <span className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Category</span>
              <DropdownMenu>
                <DropdownMenuTrigger id="product-category" className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors flex items-center justify-between text-left">
                  <span className="truncate">
                    {editingProduct.category 
                      ? categories.find(c => c.id === editingProduct.category)?.name || editingProduct.category 
                      : 'Select a category'}
                  </span>
                  <ChevronDown size={16} className="text-burgundy/40 flex-shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] bg-white border border-burgundy/10 shadow-lg shadow-burgundy/5 rounded-xl p-1 z-[100]"
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
              <label htmlFor="product-price" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Price (Rs.)</label>
              <input 
                id="product-price"
                type="number" 
                value={editingProduct.price ?? ''}
                onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value === '' ? '' as any : Number(e.target.value)})}
                onKeyDown={(e) => { if (!/^[0-9.]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'].includes(e.key)) e.preventDefault(); }}
                className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="product-original-price" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Original Price (Rs.)</label>
              <input 
                id="product-original-price"
                type="number" 
                value={editingProduct.originalPrice ?? ''}
                onChange={(e) => setEditingProduct({...editingProduct, originalPrice: e.target.value === '' ? '' as any : Number(e.target.value)})}
                onKeyDown={(e) => { if (!/^[0-9.]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'].includes(e.key)) e.preventDefault(); }}
                className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="product-short-desc" className="block text-xs font-bold text-burgundy/60 font-ui uppercase tracking-wider">Short Description</label>
                <span className="text-xs text-burgundy/50 font-body">{(editingProduct.shortDescription || '').length}/120</span>
              </div>
              <textarea 
                id="product-short-desc"
                maxLength={120}
                value={editingProduct.shortDescription || ''}
                onChange={(e) => setEditingProduct({...editingProduct, shortDescription: e.target.value})}
                rows={2}
                className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="product-desc" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Full Description</label>
              <textarea 
                id="product-desc"
                value={editingProduct.description || ''}
                onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                rows={4}
                className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="product-material" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Material</label>
              <input 
                id="product-material"
                type="text" 
                value={editingProduct.material || ''}
                onChange={(e) => setEditingProduct({...editingProduct, material: e.target.value})}
                className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="product-weight" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Weight</label>
              <input 
                id="product-weight"
                type="text" 
                value={editingProduct.weight || ''}
                onChange={(e) => setEditingProduct({...editingProduct, weight: e.target.value})}
                className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <span className="block text-sm font-semibold text-burgundy mb-2">Colors</span>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const activeColors = new Set(editingProduct.colors || []);
                  return ["Gold", "Silver", "Rose Gold", "Platinum", "Black"].map(color => (
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
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${activeColors.has(color) ? 'bg-burgundy text-white border-burgundy' : 'bg-ivory/30 text-burgundy/70 border-burgundy/20 hover:border-burgundy/50 hover:bg-ivory'}`}
                  >
                    {color}
                  </button>
                ));
                })()}
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <span className="block text-sm font-semibold text-burgundy mb-2">Tags</span>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const activeTags = new Set(editingProduct.tags || []);
                  return ["necklace", "gold", "minimalist", "earrings", "rings", "bracelets", "silver", "diamonds", "pearls", "bestseller", "new", "sale", "trendy", "classic", "bridal"].map(tag => (
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
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${activeTags.has(tag) ? 'bg-burgundy text-white border-burgundy' : 'bg-ivory/30 text-burgundy/70 border-burgundy/20 hover:border-burgundy/50 hover:bg-ivory'}`}
                  >
                    {tag}
                  </button>
                ));
                })()}
              </div>
            </div>
            
            <div>
              <label htmlFor="product-rating" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Rating (1-5)</label>
              <input 
                id="product-rating"
                type="number" 
                min="1"
                max="5"
                step="1"
                value={editingProduct.rating ?? 1}
                onChange={(e) => {
                  if (e.target.value === '') {
                    setEditingProduct({...editingProduct, rating: '' as any});
                  } else {
                    let val = Number(e.target.value);
                    if (val > 5) val = 5;
                    if (val < 1) val = 1;
                    setEditingProduct({...editingProduct, rating: val});
                  }
                }}
                onKeyDown={(e) => { if (!/^[0-9]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'].includes(e.key)) e.preventDefault(); }}
                className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="product-review-count" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Review Count</label>
              <input 
                id="product-review-count"
                type="number" 
                min="0"
                step="1"
                value={editingProduct.reviewCount ?? 0}
                onChange={(e) => setEditingProduct({...editingProduct, reviewCount: e.target.value === '' ? '' as any : Math.floor(Number(e.target.value))})}
                onKeyDown={(e) => { if (!/^[0-9]$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'].includes(e.key)) e.preventDefault(); }}
                className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
              />
            </div>

            <EditProductImages
              editingProduct={editingProduct}
              newImagePreviews={newImagePreviews}
              handleImageChange={handleImageChange}
              removeNewImage={removeNewImage}
              removeExistingImage={removeExistingImage}
            />

            <EditProductBadge 
              editingProduct={editingProduct}
              setEditingProduct={setEditingProduct}
            />
            
            <div>
              <span className="block text-xs font-bold opacity-0 mb-2 font-ui tracking-wider pointer-events-none select-none">In Stock</span>
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
  );
}
