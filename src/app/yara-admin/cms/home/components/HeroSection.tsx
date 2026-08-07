import { Layout, ChevronUp, ChevronDown, ImagePlus, Upload } from 'lucide-react';

export function HeroSection({ expandedSections, toggleSection }: any) {
  return (
    <>
        {/* Hero Section */}
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition duration-300">
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
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider" htmlFor="field_06e934">Desktop Background (16:9)</label>
                  <div className="border-2 border-dashed border-burgundy/20 rounded-xl p-8 flex flex-col items-center justify-center bg-ivory/30 hover:bg-rose-gold/10 transition-colors cursor-pointer group h-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
                    <div className="relative z-10 w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                      <ImagePlus size={20} className="text-burgundy/80" />
                    </div>
                    <p className="relative z-10 font-ui text-sm text-burgundy font-semibold">Change Image</p>
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Mobile Background (9:16)</span>
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
                  <label htmlFor="field_06e934" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Headline</label>
                  <input id="field_06e934" aria-label="Action" 
                    type="text" 
                    defaultValue="Elegance in Every Detail"
                    className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-3 font-heading text-xl text-burgundy focus:border-burgundy/30 outline-none transition-colors focus:bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider" htmlFor="subheadline_3ebc33">Subheadline</label>
                  <textarea id="subheadline_3ebc33" aria-label="Action" 
                    rows={2}
                    defaultValue="Discover our new collection of fine jewelry, crafted for life's most precious moments."
                    className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors focus:bg-white resize-none"
                  />
                </div>
                
                {/* CTA Buttons */}
                <div className="bg-ivory/30 p-4 rounded-xl border border-burgundy/10 space-y-4">
                  <h3 className="font-ui text-sm font-bold text-burgundy">Primary Button</h3>
                  <div>
                    <label className="block text-[10px] font-bold text-burgundy/50 mb-1 font-ui uppercase" htmlFor="text_77c0d7">Text</label>
                    <input id="text_77c0d7" aria-label="Action" type="text" defaultValue="Shop Collection" className="w-full bg-white border border-burgundy/10 rounded-lg px-3 py-2 text-sm text-burgundy outline-none focus:border-burgundy/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-burgundy/50 mb-1 font-ui uppercase" htmlFor="link_05b320">Link</label>
                    <input id="link_05b320" aria-label="Action" type="text" defaultValue="/shop" className="w-full bg-white border border-burgundy/10 rounded-lg px-3 py-2 text-sm text-burgundy outline-none focus:border-burgundy/30" />
                  </div>
                </div>
                
                <div className="bg-ivory/30 p-4 rounded-xl border border-burgundy/10 space-y-4">
                  <h3 className="font-ui text-sm font-bold text-burgundy">Secondary Button (Optional)</h3>
                  <div>
                    <label className="block text-[10px] font-bold text-burgundy/50 mb-1 font-ui uppercase" htmlFor="text_fc186b">Text</label>
                    <input id="text_fc186b" aria-label="e.g., View Lookbook" type="text" placeholder="e.g., View Lookbook" className="w-full bg-white border border-burgundy/10 rounded-lg px-3 py-2 text-sm text-burgundy outline-none focus:border-burgundy/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-burgundy/50 mb-1 font-ui uppercase" htmlFor="link_8718f4">Link</label>
                    <input id="link_8718f4" aria-label="e.g., /lookbook" type="text" placeholder="e.g., /lookbook" className="w-full bg-white border border-burgundy/10 rounded-lg px-3 py-2 text-sm text-burgundy outline-none focus:border-burgundy/30" />
                  </div>
                </div>

                {/* Appearance */}
                <div className="md:col-span-2 flex gap-6 mt-2">
                  <div>
                    <span className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Text Alignment</span>
                    <div className="flex bg-ivory/50 rounded-lg p-1 border border-burgundy/10">
                      <button className="px-4 py-1.5 rounded bg-white shadow-sm font-ui text-sm text-burgundy font-medium">Left</button>
                      <button className="px-4 py-1.5 rounded text-burgundy/60 hover:text-burgundy font-ui text-sm font-medium transition-colors">Center</button>
                      <button className="px-4 py-1.5 rounded text-burgundy/60 hover:text-burgundy font-ui text-sm font-medium transition-colors">Right</button>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Text Theme</span>
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

    </>
  );
}
