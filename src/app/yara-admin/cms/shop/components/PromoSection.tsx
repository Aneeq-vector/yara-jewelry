import { Type, ChevronUp, ChevronDown } from 'lucide-react';

export function PromoSection({ expandedSections, toggleSection }: any) {
  return (
    <>
        {/* Promotional Banner (In-Grid) */}
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition duration-300">
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
                <label className="relative inline-flex items-center cursor-pointer" htmlFor="field_5f06db">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-burgundy/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition peer-checked:bg-burgundy"></div>
                  <span className="ml-3 text-sm font-bold font-ui text-burgundy uppercase tracking-wider">Enable Banner (appears between product rows)</span>
                </label>
              </div>
              
              <div>
                <label htmlFor="field_5f06db" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Banner Text</label>
                <input id="field_5f06db" aria-label="Action" 
                  type="text" 
                  defaultValue="Join our loyalty program and get 15% off your first purchase! ✨"
                  className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="backgroundcolor_3ed744" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Background Color</label>
                  <div className="flex items-center gap-2 border border-burgundy/10 p-1.5 rounded-xl bg-ivory/50">
                    <div className="w-8 h-8 rounded-lg bg-[#38131D] shadow-sm"></div>
                    <input id="backgroundcolor_3ed744" aria-label="Action" type="text" defaultValue="#38131D" className="w-full bg-transparent border-none outline-none font-ui text-sm text-burgundy px-2" />
                  </div>
                </div>
                <div>
                  <label htmlFor="textcolor_73d591" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Text Color</label>
                  <div className="flex items-center gap-2 border border-burgundy/10 p-1.5 rounded-xl bg-ivory/50">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-burgundy/10 shadow-sm"></div>
                    <input id="textcolor_73d591" aria-label="Action" type="text" defaultValue="#FAF7F2" className="w-full bg-transparent border-none outline-none font-ui text-sm text-burgundy px-2" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

    </>
  );
}
