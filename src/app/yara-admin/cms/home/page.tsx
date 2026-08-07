'use client';

import { useState } from 'react';
import { AnnouncementSection } from './components/AnnouncementSection';
import { HeroSection } from './components/HeroSection';
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
        
        <AnnouncementSection expandedSections={expandedSections} toggleSection={toggleSection} />

        <HeroSection expandedSections={expandedSections} toggleSection={toggleSection} />

        {/* Featured Categories */}
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition duration-300">
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
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider" htmlFor="sectiontitle_810a87">Section Title</label>
                  <input id="sectiontitle_810a87" aria-label="Action" type="text" defaultValue="Shop by Category" className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-heading text-lg text-burgundy outline-none focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider" htmlFor="subtitleoptional_2c6b81">Subtitle (Optional)</label>
                  <input id="subtitleoptional_2c6b81" aria-label="Explore our curated collections" type="text" placeholder="Explore our curated collections" className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy outline-none focus:bg-white" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-xs font-bold text-burgundy/60 font-ui uppercase tracking-wider" htmlFor="field_27f553">Categories Grid</label>
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
                          <label htmlFor="field_27f553" className="block text-[10px] font-bold text-burgundy/50 mb-1 font-ui uppercase">Title</label>
                          <input id="field_27f553" aria-label="Action" type="text" defaultValue={category.title} className="w-full bg-ivory/30 border border-transparent hover:border-burgundy/10 focus:border-burgundy/30 rounded-lg px-3 py-1.5 font-body text-burgundy text-sm outline-none transition-colors" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-burgundy/50 mb-1 font-ui uppercase" htmlFor="link_b8ac74">Link</label>
                          <input id="link_b8ac74" aria-label="Action" type="text" defaultValue={category.link} className="w-full bg-ivory/30 border border-transparent hover:border-burgundy/10 focus:border-burgundy/30 rounded-lg px-3 py-1.5 font-body text-burgundy text-sm outline-none transition-colors" />
                        </div>
                      </div>
                      <button aria-label="Action" 
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
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition duration-300">
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
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider" htmlFor="sectiontitle_c96a04">Section Title</label>
                  <input id="sectiontitle_c96a04" aria-label="Action" type="text" defaultValue="Trending Now" className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-heading text-lg text-burgundy outline-none focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider" htmlFor="selectionmethod_1b1ea5">Selection Method</label>
                  <select id="selectionmethod_1b1ea5" aria-label="Action" className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy outline-none focus:bg-white appearance-none cursor-pointer">
                    <option>Dynamic (Based on Tag: "Trending")</option>
                    <option>Dynamic (New Arrivals)</option>
                    <option>Dynamic (Best Sellers)</option>
                    <option>Manual Selection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider" htmlFor="numberofproducts_826c05">Number of Products</label>
                  <select id="numberofproducts_826c05" aria-label="Action" defaultValue="8 Products (2 Rows)" className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy outline-none focus:bg-white appearance-none cursor-pointer">
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
