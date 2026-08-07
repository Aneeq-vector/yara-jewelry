import React from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, Save } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
}

export interface FormDataState {
  name: string;
  productCode: string;
  price: string;
  originalPrice: string;
  category: string;
  inStock: boolean;
  badge: string;
  shortDescription: string;
  description: string;
  material: string;
  weight: string;
  colors: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
}

interface ProductFormUIProps {
  formData: FormDataState;
  setFormData: React.Dispatch<React.SetStateAction<FormDataState>>;
  categories: Category[];
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreviews: string[];
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export function ProductFormUI({
  formData,
  setFormData,
  categories,
  handleNameChange,
  imagePreviews,
  handleImageChange,
  removeImage,
  handleSubmit,
  loading,
}: ProductFormUIProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-bold text-burgundy border-b border-burgundy/10 pb-2">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-burgundy" htmlFor="productname_2d7a62">Product Name *</label>
            <input id="productname_2d7a62" aria-label="e.g. Diamond Solitaire Ring" 
              type="text" 
              required
              value={formData.name}
              onChange={handleNameChange}
              className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors"
              placeholder="e.g. Diamond Solitaire Ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-burgundy" htmlFor="field_f2ea19">Product Code (Auto-generated) *</label>
            <input id="field_f2ea19" aria-label="Action" 
              type="text" 
              readOnly
              value={formData.productCode}
              className="w-full bg-ivory/50 border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy/60 outline-none cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-burgundy" htmlFor="category_7810b2">Category</label>
            <select id="category_7810b2" aria-label="Action" 
              value={formData.category}
              onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
              className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors cursor-pointer"
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-bold text-burgundy border-b border-burgundy/10 pb-2">Pricing & Inventory</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-burgundy" htmlFor="pricers_6d6a82">Price (Rs.) *</label>
            <input id="pricers_6d6a82" aria-label="e.g. 45000" 
              type="number" 
              required
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
              className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors"
              placeholder="e.g. 45000"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-burgundy" htmlFor="field_c80a3d">Original Price (Optional, Rs.)</label>
            <input id="field_c80a3d" aria-label="e.g. 55000" 
              type="number" 
              min="0"
              value={formData.originalPrice}
              onChange={(e) => setFormData(prev => ({...prev, originalPrice: e.target.value}))}
              className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors"
              placeholder="e.g. 55000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold opacity-0 select-none pointer-events-none" htmlFor="field_7d2c3d">In Stock</label>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-burgundy/20">
              <input 
                type="checkbox" 
                id="inStock"
                checked={formData.inStock}
                onChange={(e) => setFormData(prev => ({...prev, inStock: e.target.checked}))}
                className="w-5 h-5 rounded border-burgundy/20 text-burgundy focus:ring-burgundy cursor-pointer accent-burgundy"
              />
              <label htmlFor="inStock" className="text-sm font-semibold text-burgundy cursor-pointer">Product is in stock</label>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="field_7d2c3d" className="text-sm font-semibold text-burgundy">Badge (Optional)</label>
            <select id="field_7d2c3d" aria-label="Action" 
              value={formData.badge}
              onChange={(e) => setFormData(prev => ({...prev, badge: e.target.value}))}
              className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors cursor-pointer"
            >
              <option value="">None</option>
              <option value="best-seller">Best Seller</option>
              <option value="trending">Trending</option>
              <option value="new">New</option>
              <option value="limited">Limited</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-bold text-burgundy border-b border-burgundy/10 pb-2">Images</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {imagePreviews.map((preview, idx) => (
              <div key={preview} className="relative aspect-square rounded-xl overflow-hidden border border-burgundy/10 group bg-champagne">
                <Image src={preview} alt="Preview" fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" className="object-cover" />
                <button aria-label="Action" 
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            <label className="aspect-square rounded-xl border-2 border-dashed border-burgundy/20 hover:border-burgundy/50 hover:bg-ivory/30 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer text-burgundy/60 hover:text-burgundy" htmlFor="field_f0159c">
              <Upload size={24} />
              <span className="text-xs font-medium font-ui">Upload Image</span>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                className="hidden" 
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-bold text-burgundy border-b border-burgundy/10 pb-2">Details</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="field_f0159c" className="text-sm font-semibold text-burgundy">Short Description *</label>
            <input id="field_f0159c" aria-label="Brief one-liner describing the product." 
              type="text" 
              required
              value={formData.shortDescription}
              onChange={(e) => setFormData(prev => ({...prev, shortDescription: e.target.value}))}
              className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors"
              placeholder="Brief one-liner describing the product."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-burgundy" htmlFor="fulldescription_3965cd">Full Description *</label>
            <textarea id="fulldescription_3965cd" aria-label="Detailed description..." 
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-3 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors resize-y"
              placeholder="Detailed description..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-burgundy" htmlFor="material_c1872f">Material</label>
              <input id="material_c1872f" aria-label="e.g. 18k Gold" 
                type="text" 
                value={formData.material}
                onChange={(e) => setFormData(prev => ({...prev, material: e.target.value}))}
                className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors"
                placeholder="e.g. 18k Gold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-burgundy" htmlFor="weight_8565f0">Weight</label>
              <input id="weight_8565f0" aria-label="e.g. 2.5g" 
                type="text" 
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({...prev, weight: e.target.value}))}
                className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors"
                placeholder="e.g. 2.5g"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-burgundy" htmlFor="field_b72906">Colors</label>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const colorSet = new Set(formData.colors);
                  return ["Rose Gold", "Yellow Gold", "White Gold", "Silver", "Platinum", "Two-Tone", "Black", "Custom"].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setFormData(prev => {
                        const prevSet = new Set(prev.colors);
                        if (prevSet.has(color)) {
                          prevSet.delete(color);
                          return { ...prev, colors: Array.from(prevSet) };
                        } else {
                          return { ...prev, colors: [...prev.colors, color] };
                        }
                      });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${colorSet.has(color) ? 'bg-burgundy text-white border-burgundy' : 'bg-ivory/30 text-burgundy/70 border-burgundy/20 hover:border-burgundy/50 hover:bg-ivory'}`}
                  >
                    {color}
                  </button>
                ));
                })()}
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <span className="block text-sm font-semibold text-burgundy">Tags</span>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const tagSet = new Set(formData.tags);
                  return ["necklace", "gold", "minimalist", "earrings", "rings", "bracelets", "silver", "diamonds", "pearls", "bestseller", "new", "sale", "trendy", "classic", "bridal"].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setFormData(prev => {
                        const prevSet = new Set(prev.tags);
                        if (prevSet.has(tag)) {
                          prevSet.delete(tag);
                          return { ...prev, tags: Array.from(prevSet) };
                        } else {
                          return { ...prev, tags: [...prev.tags, tag] };
                        }
                      });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${tagSet.has(tag) ? 'bg-burgundy text-white border-burgundy' : 'bg-ivory/30 text-burgundy/70 border-burgundy/20 hover:border-burgundy/50 hover:bg-ivory'}`}
                  >
                    {tag}
                  </button>
                ));
                })()}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="field_b72906" className="text-sm font-semibold text-burgundy">Rating (1-5)</label>
              <input id="field_b72906" aria-label="Action" 
                type="number" 
                min="1"
                max="5"
                step="1"
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({...prev, rating: Number(e.target.value)}))}
                className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-burgundy" htmlFor="reviewcount_f46143">Review Count</label>
              <input id="reviewcount_f46143" aria-label="Action" 
                type="number" 
                min="0"
                step="1"
                value={formData.reviewCount}
                onChange={(e) => setFormData(prev => ({...prev, reviewCount: Math.floor(Number(e.target.value))}))}
                onKeyDown={(e) => { if (e.key === '.' || e.key === 'e') e.preventDefault(); }}
                className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="flex items-center gap-2 bg-burgundy text-white px-8 py-3 rounded-xl font-ui font-semibold hover:bg-wine transition-colors shadow-lg shadow-burgundy/30 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
