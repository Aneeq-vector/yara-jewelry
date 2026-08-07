import { Type, ChevronUp, ChevronDown, Link as LinkIcon } from 'lucide-react';

export function AnnouncementSection({ expandedSections, toggleSection }: any) {
  return (
    <>
        {/* Announcement Bar */}
        <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden transition duration-300">
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
                <label className="relative inline-flex items-center cursor-pointer" htmlFor="field_879692">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-burgundy/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition peer-checked:bg-burgundy"></div>
                  <span className="ml-3 text-sm font-bold font-ui text-burgundy uppercase tracking-wider">Enable Announcement Bar</span>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="field_879692" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Announcement Text</label>
                  <input id="field_879692" aria-label="Action" 
                    type="text" 
                    defaultValue="✨ Free shipping on all orders over Rs. 10,000! ✨"
                    className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl px-4 py-2.5 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors focus:bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="linkoptional_4e9bcf" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Link (Optional)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-burgundy/40" size={16} />
                    <input id="linkoptional_4e9bcf" aria-label="/shop" 
                      type="text" 
                      placeholder="/shop"
                      className="w-full bg-ivory/50 border border-burgundy/10 rounded-xl pl-10 pr-4 py-2.5 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors focus:bg-white"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor="backgroundcolor_71cf6f" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Background Color</label>
                    <div className="flex items-center gap-2 border border-burgundy/10 p-1.5 rounded-xl bg-ivory/50">
                      <div className="w-8 h-8 rounded-lg bg-[#38131D] shadow-sm"></div>
                      <input id="backgroundcolor_71cf6f" aria-label="Action" type="text" defaultValue="#38131D" className="w-full bg-transparent border-none outline-none font-ui text-sm text-burgundy px-2" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="textcolor_1051c5" className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Text Color</label>
                    <div className="flex items-center gap-2 border border-burgundy/10 p-1.5 rounded-xl bg-ivory/50">
                      <div className="w-8 h-8 rounded-lg bg-white border border-burgundy/10 shadow-sm"></div>
                      <input id="textcolor_1051c5" aria-label="Action" type="text" defaultValue="#FFFFFF" className="w-full bg-transparent border-none outline-none font-ui text-sm text-burgundy px-2" />
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
