'use client';

import { useState } from 'react';
import { Upload, Save, Eye, Layout, Type, Filter, SearchX, ImagePlus, ChevronDown, ChevronUp } from 'lucide-react';

export default function ShopCMS() {
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    header: true,
    promo: false,
    layout: false,
    filters: false,
    empty: false,
  });

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
          <h1 className="text-2xl font-heading font-bold text-burgundy">Shop Page Editor</h1>
          <p className="text-burgundy/60 font-body text-sm mt-1">Manage the catalog layout, filters, and promotional banners.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-burgundy/20 text-burgundy px-4 py-2 rounded-xl font-ui text-sm font-semibold hover:bg-rose-gold/10 transition-colors shadow-sm">
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
        
        {/* Header / Banner */}
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition-all duration-300">
          <button 
            onClick={() => toggleSection('header')}
            className="w-full px-6 py-4 border-b border-burgundy/5 bg-ivory/50 flex justify-between items-center hover:bg-ivory/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Type className="text-burgundy/60" size={20} />
              <h2 className="font-heading font-bold text-burgundy text-lg">Shop Header</h2>
            </div>
            {expandedSections.header ? <ChevronUp size={20} className="text-burgundy/60" /> : <ChevronDown size={20} className="text-burgundy/60" />}
          </button>
          
          {expandedSections.header && (
            <div className="p-6 space-y-6 bg-white border-t border-burgundy/5">
              <div className="flex items-center gap-4 bg-ivory/30 p-4 rounded-xl border border-burgundy/10">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-burgundy/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy"></div>
                  <span className="ml-3 text-sm font-bold font-ui text-burgundy uppercase tracking-wider">Show Shop Header Banner</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Page Title</label>
                  <input 
                    type="text" 
                    defaultValue="All Fine Jewelry"
                    className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-3 font-heading text-xl text-burgundy focus:border-burgundy/30 outline-none transition-colors focus:bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">SEO Description (appears under title)</label>
                  <textarea 
                    rows={2}
                    defaultValue="Explore our complete collection of handcrafted fine jewelry. From timeless diamond classics to modern statement pieces."
                    className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors focus:bg-white resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Header Background Image (Optional)</label>
                  <div className="border-2 border-dashed border-burgundy/20 rounded-xl p-6 flex flex-col items-center justify-center bg-ivory/30 hover:bg-rose-gold/10 transition-colors cursor-pointer group h-32 relative overflow-hidden">
                    <div className="relative z-10 w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
                      <ImagePlus size={18} className="text-burgundy/80" />
                    </div>
                    <p className="relative z-10 font-ui text-sm text-burgundy font-semibold">Upload Image</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Promotional Banner (In-Grid) */}
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition-all duration-300">
          <button 
            onClick={() => toggleSection('promo')}
            className="w-full px-6 py-4 border-b border-burgundy/5 bg-ivory/50 flex justify-between items-center hover:bg-ivory/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Type className="text-burgundy/60" size={20} />
              <h2 className="font-heading font-bold text-burgundy text-lg">In-Grid Promotional Banner</h2>
            </div>
            {expandedSections.promo ? <ChevronUp size={20} className="text-burgundy/60" /> : <ChevronDown size={20} className="text-burgundy/60" />}
          </button>
          
          {expandedSections.promo && (
             <div className="p-6 space-y-6 bg-white border-t border-burgundy/5">
              <div className="flex items-center gap-4 bg-ivory/30 p-4 rounded-xl border border-burgundy/10">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-burgundy/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy"></div>
                  <span className="ml-3 text-sm font-bold font-ui text-burgundy uppercase tracking-wider">Enable Banner (appears between product rows)</span>
                </label>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Banner Text</label>
                <input 
                  type="text" 
                  defaultValue="Join our loyalty program and get 15% off your first purchase! ✨"
                  className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Background Color</label>
                  <div className="flex items-center gap-2 border border-burgundy/10 p-1.5 rounded-xl bg-ivory/50">
                    <div className="w-8 h-8 rounded-lg bg-[#38131D] shadow-sm"></div>
                    <input type="text" defaultValue="#38131D" className="w-full bg-transparent border-none outline-none font-ui text-sm text-burgundy px-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Text Color</label>
                  <div className="flex items-center gap-2 border border-burgundy/10 p-1.5 rounded-xl bg-ivory/50">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-burgundy/10 shadow-sm"></div>
                    <input type="text" defaultValue="#FAF7F2" className="w-full bg-transparent border-none outline-none font-ui text-sm text-burgundy px-2" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Layout & Display */}
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition-all duration-300">
           <button 
            onClick={() => toggleSection('layout')}
            className="w-full px-6 py-4 border-b border-burgundy/5 bg-ivory/50 flex justify-between items-center hover:bg-ivory/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Layout className="text-burgundy/60" size={20} />
              <h2 className="font-heading font-bold text-burgundy text-lg">Layout & Display Options</h2>
            </div>
            {expandedSections.layout ? <ChevronUp size={20} className="text-burgundy/60" /> : <ChevronDown size={20} className="text-burgundy/60" />}
          </button>
          
          {expandedSections.layout && (
            <div className="p-6 space-y-8 bg-white border-t border-burgundy/5">
              <div>
                <label className="block text-xs font-bold text-burgundy/60 mb-4 font-ui uppercase tracking-wider">Filter Layout</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border-2 border-burgundy rounded-xl p-4 text-center cursor-pointer bg-rose-gold/5 relative transition-colors shadow-sm">
                    <div className="absolute top-2 right-2 w-4 h-4 bg-burgundy rounded-full flex items-center justify-center shadow-sm">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <div className="h-16 bg-white border border-burgundy/10 rounded-lg mb-3 flex items-center justify-center px-2">
                      <div className="flex gap-2 w-full justify-center">
                        <div className="w-6 h-2 bg-burgundy/20 rounded-sm"></div>
                        <div className="w-8 h-2 bg-burgundy/20 rounded-sm"></div>
                        <div className="w-5 h-2 bg-burgundy/20 rounded-sm"></div>
                      </div>
                    </div>
                    <span className="font-ui text-sm font-bold text-burgundy">Horizontal (Top)</span>
                  </div>
                  <div className="border border-burgundy/10 rounded-xl p-4 text-center cursor-pointer hover:border-burgundy/30 hover:bg-ivory/30 transition-colors">
                    <div className="h-16 bg-white border border-burgundy/10 rounded-lg mb-3 flex px-2 py-3">
                      <div className="flex flex-col gap-2 w-10 border-r border-burgundy/10 pr-2">
                        <div className="w-full h-1.5 bg-burgundy/20 rounded-sm"></div>
                        <div className="w-full h-1.5 bg-burgundy/10 rounded-sm"></div>
                        <div className="w-full h-1.5 bg-burgundy/10 rounded-sm"></div>
                      </div>
                      <div className="flex-1 pl-2 grid grid-cols-2 gap-1.5">
                        <div className="bg-burgundy/5 rounded-sm w-full h-full"></div>
                        <div className="bg-burgundy/5 rounded-sm w-full h-full"></div>
                      </div>
                    </div>
                    <span className="font-ui text-sm font-medium text-burgundy/70">Sidebar Left</span>
                  </div>
                   <div className="border border-burgundy/10 rounded-xl p-4 text-center cursor-pointer hover:border-burgundy/30 hover:bg-ivory/30 transition-colors">
                    <div className="h-16 bg-white border border-burgundy/10 rounded-lg mb-3 flex px-2 py-3">
                      <div className="flex-1 pr-2 grid grid-cols-2 gap-1.5">
                        <div className="bg-burgundy/5 rounded-sm w-full h-full"></div>
                        <div className="bg-burgundy/5 rounded-sm w-full h-full"></div>
                      </div>
                      <div className="flex flex-col gap-2 w-10 border-l border-burgundy/10 pl-2">
                        <div className="w-full h-1.5 bg-burgundy/20 rounded-sm"></div>
                        <div className="w-full h-1.5 bg-burgundy/10 rounded-sm"></div>
                        <div className="w-full h-1.5 bg-burgundy/10 rounded-sm"></div>
                      </div>
                    </div>
                    <span className="font-ui text-sm font-medium text-burgundy/70">Sidebar Right</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Products Per Page</label>
                  <select defaultValue="24 (Desktop: 6 rows of 4)" className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy outline-none focus:bg-white appearance-none cursor-pointer">
                    <option>12 (Desktop: 3 rows of 4)</option>
                    <option>24 (Desktop: 6 rows of 4)</option>
                    <option>48 (Desktop: 12 rows of 4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Product Card Interactions</label>
                  <div className="space-y-3 mt-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 rounded text-burgundy border-burgundy/30 focus:ring-burgundy" defaultChecked />
                      <span className="text-sm font-body text-burgundy">Show secondary image on hover</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 rounded text-burgundy border-burgundy/30 focus:ring-burgundy" defaultChecked />
                      <span className="text-sm font-body text-burgundy">Show "Add to Cart" button on hover</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtering & Sorting */}
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition-all duration-300">
           <button 
            onClick={() => toggleSection('filters')}
            className="w-full px-6 py-4 border-b border-burgundy/5 bg-ivory/50 flex justify-between items-center hover:bg-ivory/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Filter className="text-burgundy/60" size={20} />
              <h2 className="font-heading font-bold text-burgundy text-lg">Filtering & Sorting</h2>
            </div>
            {expandedSections.filters ? <ChevronUp size={20} className="text-burgundy/60" /> : <ChevronDown size={20} className="text-burgundy/60" />}
          </button>
          
          {expandedSections.filters && (
            <div className="p-6 space-y-6 bg-white border-t border-burgundy/5">
              <div>
                <label className="block text-xs font-bold text-burgundy/60 mb-3 font-ui uppercase tracking-wider">Enabled Filters</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Price Range', 'Metal Type', 'Gemstone', 'Collection', 'Style', 'Availability', 'Size'].map((filter) => (
                    <label key={filter} className="flex items-center gap-3 p-3 border border-burgundy/10 rounded-xl bg-ivory/30 hover:bg-ivory/80 transition-colors cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded text-burgundy border-burgundy/30 focus:ring-burgundy" defaultChecked={['Price Range', 'Metal Type', 'Gemstone', 'Collection'].includes(filter)} />
                      <span className="text-sm font-ui font-medium text-burgundy">{filter}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Default Sort Order</label>
                <select defaultValue="Newest Arrivals" className="w-full md:w-1/2 bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy outline-none focus:bg-white appearance-none cursor-pointer">
                  <option>Featured</option>
                  <option>Newest Arrivals</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Best Selling</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition-all duration-300">
           <button 
            onClick={() => toggleSection('empty')}
            className="w-full px-6 py-4 border-b border-burgundy/5 bg-ivory/50 flex justify-between items-center hover:bg-ivory/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <SearchX className="text-burgundy/60" size={20} />
              <h2 className="font-heading font-bold text-burgundy text-lg">Empty State Messaging</h2>
            </div>
            {expandedSections.empty ? <ChevronUp size={20} className="text-burgundy/60" /> : <ChevronDown size={20} className="text-burgundy/60" />}
          </button>
          
          {expandedSections.empty && (
            <div className="p-6 space-y-6 bg-white border-t border-burgundy/5">
              <div className="bg-ivory/30 border border-burgundy/10 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                 <SearchX size={32} className="text-burgundy/30 mb-4" />
                 <input 
                    type="text" 
                    defaultValue="No products found"
                    className="bg-transparent border-b border-dashed border-burgundy/30 font-heading text-xl text-burgundy font-bold outline-none text-center mb-2 focus:border-burgundy/60"
                  />
                  <textarea 
                    rows={2}
                    defaultValue="We couldn't find any pieces matching your current filters. Try adjusting your selections to see more results."
                    className="w-full max-w-md bg-transparent border-b border-dashed border-burgundy/30 font-body text-burgundy/70 outline-none text-center mb-6 focus:border-burgundy/60 resize-none"
                  />
                  <button className="bg-burgundy text-white px-6 py-2 rounded-xl font-ui text-sm font-semibold hover:bg-wine transition-colors">
                    Clear All Filters
                  </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
