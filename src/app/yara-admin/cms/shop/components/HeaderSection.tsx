import { Type, ChevronUp, ChevronDown, ImagePlus } from 'lucide-react';

export function HeaderSection({ expandedSections, toggleSection }: any) {
  return (
    <>
        {/* Header / Banner */}
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition duration-300">
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
                <label className="relative inline-flex items-center cursor-pointer" htmlFor="field_19d62d">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-burgundy/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition peer-checked:bg-burgundy"></div>
                  <span className="ml-3 text-sm font-bold font-ui text-burgundy uppercase tracking-wider">Show Shop Header Banner</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                  <label htmlFor="field_19d62d" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Page Title</label>
                  <input id="field_19d62d" aria-label="Action" 
                    type="text" 
                    defaultValue="All Fine Jewelry"
                    className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-3 font-heading text-xl text-burgundy focus:border-burgundy/30 outline-none transition-colors focus:bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider" htmlFor="field_098fab">SEO Description (appears under title)</label>
                  <textarea id="field_098fab" aria-label="Action" 
                    rows={2}
                    defaultValue="Explore our complete collection of handcrafted fine jewelry. From timeless diamond classics to modern statement pieces."
                    className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors focus:bg-white resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <span className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Header Background Image (Optional)</span>
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

    </>
  );
}
