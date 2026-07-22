'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Loader2, Save, X } from 'lucide-react';
import { createClient } from '@/lib/pocketbase';
import { createProductWithFilesAction } from '@/app/actions/products';
import { getAllProducts } from '@/lib/data/products';

interface Category {
  id: string;
  name: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    productCode: 'Loading...',
    price: '',
    originalPrice: '',
    category: '',
    inStock: true,
    badge: '',
    shortDescription: '',
    description: '',
    material: '',
    weight: '',
    colors: [] as string[],
    tags: [] as string[],
    rating: 1,
    reviewCount: 0
  });
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    // Fetch categories and max product code
    async function loadInitialData() {
      try {
        const pb = createClient();
        
        // Load categories
        const categoryRecords = await pb.collection('categories').getFullList({ sort: 'name' });
        setCategories(categoryRecords.map(r => ({ id: r.id, name: r.name })));

        // Load highest product code using data helper which handles cache busting
        const allProducts = await getAllProducts();
        
        let nextCodeNum = 1001; // fallback
        const yaraCodes = allProducts
          .map(r => r.productCode)
          .filter(c => c && c.startsWith('YARA-')) as string[];

        
        if (yaraCodes.length > 0) {
          // Find max number
          const maxNum = Math.max(...yaraCodes.map(c => parseInt(c.replace('YARA-', ''), 10) || 0));
          if (maxNum >= 1000) {
            nextCodeNum = maxNum + 1;
          }
        }
        
        setFormData(prev => ({ ...prev, productCode: `YARA-${nextCodeNum}` }));
      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    }
    loadInitialData();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({ ...prev, name }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const pb = createClient();
      const submitData = new FormData();

      // Basic Fields
      submitData.append('name', formData.name);
      submitData.append('productCode', formData.productCode);
      submitData.append('price', formData.price);
      if (formData.originalPrice) submitData.append('originalPrice', formData.originalPrice);
      if (formData.category) submitData.append('category', formData.category);
      submitData.append('inStock', formData.inStock.toString());
      if (formData.badge) submitData.append('badge', formData.badge);
      
      // Text Fields
      submitData.append('shortDescription', formData.shortDescription);
      // For editor fields, we send string, but ideally it should be HTML
      submitData.append('description', `<p>${formData.description}</p>`);
      
      if (formData.material) submitData.append('material', formData.material);
      if (formData.weight) submitData.append('weight', formData.weight);
      
      // Multi-select fields (colors, tags) - stored as JSON arrays in some cases or multi-select in PocketBase
      // PocketBase handles comma separated or multiple append for select fields
      if (formData.colors && formData.colors.length > 0) {
        formData.colors.forEach(c => submitData.append('colors', c));
      }
      
      if (formData.tags && formData.tags.length > 0) {
        formData.tags.forEach(t => submitData.append('tags', t));
      }
      
      submitData.append('rating', formData.rating.toString());
      submitData.append('reviewCount', formData.reviewCount.toString());

      // Images
      imageFiles.forEach(file => {
        submitData.append('images', file);
      });

      const res = await createProductWithFilesAction(submitData);
      
      if (res.error) {
        console.error('Create error:', res.error, res.details);
        throw new Error(res.error + (res.details ? ': ' + JSON.stringify(res.details) : ''));
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh(); // Force refresh to see new product
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-burgundy/5 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-burgundy" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-burgundy">Add New Product</h1>
          <p className="text-burgundy/60 font-body text-sm mt-1">Create a new product listing in your catalog.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-medium">
          {error}
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-6 right-6 bg-green-50 text-green-700 px-6 py-4 rounded-xl border border-green-200 shadow-xl z-50 flex items-center gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-sm">
            ✓
          </div>
          <div className="font-medium">Product created successfully!</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-bold text-burgundy border-b border-burgundy/10 pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-burgundy">Product Name *</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={handleNameChange}
                className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors"
                placeholder="e.g. Diamond Solitaire Ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-burgundy">Product Code (Auto-generated) *</label>
              <input 
                type="text" 
                readOnly
                value={formData.productCode}
                className="w-full bg-ivory/50 border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy/60 outline-none cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-burgundy">Category</label>
              <select 
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
              <label className="text-sm font-semibold text-burgundy">Price (Rs.) *</label>
              <input 
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
              <label className="text-sm font-semibold text-burgundy">Original Price (Optional, Rs.)</label>
              <input 
                type="number" 
                min="0"
                value={formData.originalPrice}
                onChange={(e) => setFormData(prev => ({...prev, originalPrice: e.target.value}))}
                className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors"
                placeholder="e.g. 55000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold opacity-0 select-none pointer-events-none">In Stock</label>
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
              <label className="text-sm font-semibold text-burgundy">Badge (Optional)</label>
              <select 
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
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-burgundy/10 group bg-champagne">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <label className="aspect-square rounded-xl border-2 border-dashed border-burgundy/20 hover:border-burgundy/50 hover:bg-ivory/30 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer text-burgundy/60 hover:text-burgundy">
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
              <label className="text-sm font-semibold text-burgundy">Short Description *</label>
              <input 
                type="text" 
                required
                value={formData.shortDescription}
                onChange={(e) => setFormData(prev => ({...prev, shortDescription: e.target.value}))}
                className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors"
                placeholder="Brief one-liner describing the product."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-burgundy">Full Description *</label>
              <textarea 
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
                <label className="text-sm font-semibold text-burgundy">Material</label>
                <input 
                  type="text" 
                  value={formData.material}
                  onChange={(e) => setFormData(prev => ({...prev, material: e.target.value}))}
                  className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors"
                  placeholder="e.g. 18k Gold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-burgundy">Weight</label>
                <input 
                  type="text" 
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({...prev, weight: e.target.value}))}
                  className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors"
                  placeholder="e.g. 2.5g"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-burgundy">Colors</label>
                <div className="flex flex-wrap gap-2">
                  {["Gold", "Silver", "Rose Gold", "Platinum", "Black"].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          colors: prev.colors.includes(color) 
                            ? prev.colors.filter(c => c !== color)
                            : [...prev.colors, color]
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${formData.colors.includes(color) ? 'bg-burgundy text-white border-burgundy' : 'bg-ivory/30 text-burgundy/70 border-burgundy/20 hover:border-burgundy/50 hover:bg-ivory'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-burgundy">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {["necklace", "gold", "minimalist", "earrings", "rings", "bracelets", "silver", "diamonds", "pearls", "bestseller", "new", "sale", "trendy", "classic", "bridal"].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          tags: prev.tags.includes(tag) 
                            ? prev.tags.filter(t => t !== tag)
                            : [...prev.tags, tag]
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${formData.tags.includes(tag) ? 'bg-burgundy text-white border-burgundy' : 'bg-ivory/30 text-burgundy/70 border-burgundy/20 hover:border-burgundy/50 hover:bg-ivory'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-burgundy">Rating (1-5)</label>
                <input 
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
                <label className="text-sm font-semibold text-burgundy">Review Count</label>
                <input 
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
    </div>
  );
}
