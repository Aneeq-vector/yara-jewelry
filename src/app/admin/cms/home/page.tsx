'use client';

import { useState } from 'react';
import { Upload, Plus, Trash2, Save, Eye, Image as ImageIcon, GripVertical, Settings2, Link as LinkIcon, Type, Layout, ImagePlus, ChevronDown, ChevronUp } from 'lucide-react';

export default function HomeCMS() {
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    hero: true,
    announcement: false,
    categories: false,
    products: false,
    story: false,
    newsletter: false,
  });

  const [categories, setCategories] = useState([
    { id: 1, title: 'Necklaces & Pendants', image: '/images/cat-necklaces.jpg', link: '/shop?category=necklaces' },
    { id: 2, title: 'Earrings', image: '/images/cat-earrings.jpg', link: '/shop?category=earrings' },
    { id: 3, title: 'Rings', image: '/images/cat-rings.jpg', link: '/shop?category=rings' },
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 p-4 rounded-2xl border border-burgundy/10 backdrop-blur-sm sticky top-4 z-10">
        <div>
          <h1 className="text-2xl font-heading font-bold text-burgundy">Home Page Editor</h1>
          <p className="text-burgundy/60 font-body text-sm mt-1">Manage the content and layout of your storefront.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.open('/', '_blank')}
            className="flex items-center gap-2 bg-white border border-burgundy/20 text-burgundy px-4 py-2 rounded-xl font-ui text-sm font-semibold hover:bg-rose-gold/10 transition-colors shadow-sm"
          >
            <Eye size={16} />
            Preview
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-burgundy text-white px-5 py-2 rounded-xl font-ui text-sm font-semibold hover:bg-wine transition-colors shadow-md shadow-burgundy/20"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Publish Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Announcement Bar */}
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition-all duration-300">
          <button 
            onClick={() => toggleSection('announcement')}
            className="w-full px-6 py-4 border-b border-burgundy/5 bg-ivory/50 flex justify-between items-center hover:bg-ivory/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Type className="text-burgundy/60" size={20} />
              <h2 className="font-heading font-bold text-burgundy text-lg">Announcement Bar</h2>
            </div>
            {expandedSections.announcement ? <ChevronUp size={20} className="text-burgundy/60" /> : <ChevronDown size={20} className="text-burgundy/60" />}
          </button>
          
          {expandedSections.announcement && (
            <div className="p-6 space-y-6 bg-white border-t border-burgundy/5">
              <div className="flex items-center gap-4 bg-ivory/30 p-4 rounded-xl border border-burgundy/10">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-burgundy/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy"></div>
                  <span className="ml-3 text-sm font-bold font-ui text-burgundy uppercase tracking-wider">Enable Announcement Bar</span>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Announcement Text</label>
                  <input 
                    type="text" 
                    defaultValue="✨ Free shipping on all orders over Rs. 10,000! ✨"
                    className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Link (Optional)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-burgundy/40" size={16} />
                    <input 
                      type="text" 
                      placeholder="/shop"
                      className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl pl-10 pr-4 py-2.5 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors focus:bg-white"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Background Color</label>
                    <div className="flex items-center gap-2 border border-burgundy/10 p-1.5 rounded-xl bg-ivory/50">
                      <div className="w-8 h-8 rounded-lg bg-[#38131D] shadow-sm"></div>
                      <input type="text" defaultValue="#38131D" className="w-full bg-transparent border-none outline-none font-ui text-sm text-burgundy px-2" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Text Color</label>
                    <div className="flex items-center gap-2 border border-burgundy/10 p-1.5 rounded-xl bg-ivory/50">
                      <div className="w-8 h-8 rounded-lg bg-white border border-burgundy/10 shadow-sm"></div>
                      <input type="text" defaultValue="#FFFFFF" className="w-full bg-transparent border-none outline-none font-ui text-sm text-burgundy px-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition-all duration-300">
          <button 
            onClick={() => toggleSection('hero')}
            className="w-full px-6 py-4 border-b border-burgundy/5 bg-ivory/50 flex justify-between items-center hover:bg-ivory/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Layout className="text-burgundy/60" size={20} />
              <h2 className="font-heading font-bold text-burgundy text-lg">Hero Section</h2>
            </div>
            {expandedSections.hero ? <ChevronUp size={20} className="text-burgundy/60" /> : <ChevronDown size={20} className="text-burgundy/60" />}
          </button>
          
          {expandedSections.hero && (
            <div className="p-6 space-y-8 bg-white border-t border-burgundy/5">
              {/* Media Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Desktop Background (16:9)</label>
                  <div className="border-2 border-dashed border-burgundy/20 rounded-xl p-8 flex flex-col items-center justify-center bg-ivory/30 hover:bg-rose-gold/10 transition-colors cursor-pointer group h-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
                    <div className="relative z-10 w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                      <ImagePlus size={20} className="text-burgundy/80" />
                    </div>
                    <p className="relative z-10 font-ui text-sm text-burgundy font-semibold">Change Image</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Mobile Background (9:16)</label>
                  <div className="border-2 border-dashed border-burgundy/20 rounded-xl p-8 flex flex-col items-center justify-center bg-ivory/30 hover:bg-rose-gold/10 transition-colors cursor-pointer group h-48">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                      <Upload size={20} className="text-burgundy/60" />
                    </div>
                    <p className="font-ui text-sm text-burgundy font-semibold">Upload Image</p>
                    <p className="font-body text-xs text-burgundy/50 mt-1">Recommended: 1080x1920px</p>
                  </div>
                </div>
              </div>

              {/* Typography & Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-burgundy/5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Headline</label>
                  <input 
                    type="text" 
                    defaultValue="Elegance in Every Detail"
                    className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-3 font-heading text-xl text-burgundy focus:border-burgundy/30 outline-none transition-colors focus:bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Subheadline</label>
                  <textarea 
                    rows={2}
                    defaultValue="Discover our new collection of fine jewelry, crafted for life's most precious moments."
                    className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors focus:bg-white resize-none"
                  />
                </div>
                
                {/* CTA Buttons */}
                <div className="bg-ivory/30 p-4 rounded-xl border border-burgundy/10 space-y-4">
                  <h3 className="font-ui text-sm font-bold text-burgundy">Primary Button</h3>
                  <div>
                    <label className="block text-[10px] font-bold text-burgundy/50 mb-1 font-ui uppercase">Text</label>
                    <input type="text" defaultValue="Shop Collection" className="w-full bg-white border border-burgundy/10 rounded-lg px-3 py-2 text-sm text-burgundy outline-none focus:border-burgundy/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-burgundy/50 mb-1 font-ui uppercase">Link</label>
                    <input type="text" defaultValue="/shop" className="w-full bg-white border border-burgundy/10 rounded-lg px-3 py-2 text-sm text-burgundy outline-none focus:border-burgundy/30" />
                  </div>
                </div>
                
                <div className="bg-ivory/30 p-4 rounded-xl border border-burgundy/10 space-y-4">
                  <h3 className="font-ui text-sm font-bold text-burgundy">Secondary Button (Optional)</h3>
                  <div>
                    <label className="block text-[10px] font-bold text-burgundy/50 mb-1 font-ui uppercase">Text</label>
                    <input type="text" placeholder="e.g., View Lookbook" className="w-full bg-white border border-burgundy/10 rounded-lg px-3 py-2 text-sm text-burgundy outline-none focus:border-burgundy/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-burgundy/50 mb-1 font-ui uppercase">Link</label>
                    <input type="text" placeholder="e.g., /lookbook" className="w-full bg-white border border-burgundy/10 rounded-lg px-3 py-2 text-sm text-burgundy outline-none focus:border-burgundy/30" />
                  </div>
                </div>

                {/* Appearance */}
                <div className="md:col-span-2 flex gap-6 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Text Alignment</label>
                    <div className="flex bg-ivory/50 rounded-lg p-1 border border-burgundy/10">
                      <button className="px-4 py-1.5 rounded bg-white shadow-sm font-ui text-sm text-burgundy font-medium">Left</button>
                      <button className="px-4 py-1.5 rounded text-burgundy/60 hover:text-burgundy font-ui text-sm font-medium transition-colors">Center</button>
                      <button className="px-4 py-1.5 rounded text-burgundy/60 hover:text-burgundy font-ui text-sm font-medium transition-colors">Right</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Text Theme</label>
                    <div className="flex bg-ivory/50 rounded-lg p-1 border border-burgundy/10">
                      <button className="px-4 py-1.5 rounded text-burgundy/60 hover:text-burgundy font-ui text-sm font-medium transition-colors">Dark</button>
                      <button className="px-4 py-1.5 rounded bg-burgundy shadow-sm font-ui text-sm text-white font-medium">Light</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Featured Categories */}
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition-all duration-300">
          <button 
            onClick={() => toggleSection('categories')}
            className="w-full px-6 py-4 border-b border-burgundy/5 bg-ivory/50 flex justify-between items-center hover:bg-ivory/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ImageIcon className="text-burgundy/60" size={20} />
              <h2 className="font-heading font-bold text-burgundy text-lg">Featured Categories</h2>
            </div>
            {expandedSections.categories ? <ChevronUp size={20} className="text-burgundy/60" /> : <ChevronDown size={20} className="text-burgundy/60" />}
          </button>
          
          {expandedSections.categories && (
            <div className="p-6 space-y-6 bg-white border-t border-burgundy/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Section Title</label>
                  <input type="text" defaultValue="Shop by Category" className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-heading text-lg text-burgundy outline-none focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Subtitle (Optional)</label>
                  <input type="text" placeholder="Explore our curated collections" className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy outline-none focus:bg-white" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-xs font-bold text-burgundy/60 font-ui uppercase tracking-wider">Categories Grid</label>
                  <button 
                    onClick={() => setCategories([...categories, { id: Date.now(), title: 'New Category', image: '', link: '/shop' }])}
                    className="flex items-center gap-1.5 text-xs font-bold font-ui text-burgundy hover:text-wine uppercase tracking-wider bg-rose-gold/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus size={14} /> Add Category
                  </button>
                </div>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center gap-4 p-3 border border-burgundy/10 rounded-xl bg-white hover:border-burgundy/30 transition-colors shadow-sm group">
                      <div className="cursor-grab text-burgundy/30 hover:text-burgundy">
                        <GripVertical size={20} />
                      </div>
                      <div className="w-14 h-14 bg-ivory rounded-lg flex items-center justify-center border border-burgundy/10 relative overflow-hidden group-hover:border-burgundy/30">
                        <ImageIcon size={20} className="text-burgundy/20" />
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-burgundy/50 mb-1 font-ui uppercase">Title</label>
                          <input type="text" defaultValue={category.title} className="w-full bg-ivory/30 border border-transparent hover:border-burgundy/10 focus:border-burgundy/30 rounded-lg px-3 py-1.5 font-body text-burgundy text-sm outline-none transition-colors" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-burgundy/50 mb-1 font-ui uppercase">Link</label>
                          <input type="text" defaultValue={category.link} className="w-full bg-ivory/30 border border-transparent hover:border-burgundy/10 focus:border-burgundy/30 rounded-lg px-3 py-1.5 font-body text-burgundy text-sm outline-none transition-colors" />
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (window.confirm('Remove this category?')) {
                            setCategories(categories.filter(c => c.id !== category.id));
                          }
                        }}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Featured Products */}
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition-all duration-300">
          <button 
            onClick={() => toggleSection('products')}
            className="w-full px-6 py-4 border-b border-burgundy/5 bg-ivory/50 flex justify-between items-center hover:bg-ivory/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings2 className="text-burgundy/60" size={20} />
              <h2 className="font-heading font-bold text-burgundy text-lg">Featured Products</h2>
            </div>
            {expandedSections.products ? <ChevronUp size={20} className="text-burgundy/60" /> : <ChevronDown size={20} className="text-burgundy/60" />}
          </button>
          
          {expandedSections.products && (
            <div className="p-6 space-y-6 bg-white border-t border-burgundy/5">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Section Title</label>
                  <input type="text" defaultValue="Trending Now" className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-heading text-lg text-burgundy outline-none focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Selection Method</label>
                  <select className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy outline-none focus:bg-white appearance-none cursor-pointer">
                    <option>Dynamic (Based on Tag: "Trending")</option>
                    <option>Dynamic (New Arrivals)</option>
                    <option>Dynamic (Best Sellers)</option>
                    <option>Manual Selection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Number of Products</label>
                  <select defaultValue="8 Products (2 Rows)" className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy outline-none focus:bg-white appearance-none cursor-pointer">
                    <option>4 Products (1 Row)</option>
                    <option>8 Products (2 Rows)</option>
                    <option>12 Products (3 Rows)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="w-full bg-burgundy/5 text-burgundy border border-burgundy/10 rounded-xl px-4 py-2.5 font-ui font-semibold hover:bg-burgundy/10 transition-colors">
                    Manage Specific Products
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
