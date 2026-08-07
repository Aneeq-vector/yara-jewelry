'use client';

import { useState } from 'react';
import { HeaderSection } from './components/HeaderSection';
import { PromoSection } from './components/PromoSection';
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
        
        <HeaderSection expandedSections={expandedSections} toggleSection={toggleSection} />

        <PromoSection expandedSections={expandedSections} toggleSection={toggleSection} />

        {/* Layout & Display */}
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition duration-300">
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
                <label className="block text-xs font-bold text-burgundy/60 mb-4 font-ui uppercase tracking-wider" htmlFor="field_8c5ede">Filter Layout</label>
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
                  <label htmlFor="field_8c5ede" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Products Per Page</label>
                  <select id="field_8c5ede" aria-label="Action" defaultValue="24 (Desktop: 6 rows of 4)" className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy outline-none focus:bg-white appearance-none cursor-pointer">
                    <option>12 (Desktop: 3 rows of 4)</option>
                    <option>24 (Desktop: 6 rows of 4)</option>
                    <option>48 (Desktop: 12 rows of 4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider" htmlFor="field_a20f76">Product Card Interactions</label>
                  <div className="space-y-3 mt-3">
                    <label className="flex items-center gap-3" htmlFor="field_a20f76">
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
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition duration-300">
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
                <span className="block text-xs font-bold text-burgundy/60 mb-3 font-ui uppercase tracking-wider">Enabled Filters</span>
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
                <label htmlFor="field_a20f76" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Default Sort Order</label>
                <select id="field_a20f76" aria-label="Action" defaultValue="Newest Arrivals" className="w-full md:w-1/2 bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy outline-none focus:bg-white appearance-none cursor-pointer">
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
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition duration-300">
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
                 <input aria-label="Action" 
                    type="text" 
                    defaultValue="No products found"
                    className="bg-transparent border-b border-dashed border-burgundy/30 font-heading text-xl text-burgundy font-bold outline-none text-center mb-2 focus:border-burgundy/60"
                  />
                  <textarea aria-label="Action" 
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
