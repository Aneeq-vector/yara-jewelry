const fs = require('fs');
let content = fs.readFileSync('src/app/admin/products/new/page.tsx', 'utf8');

// Replace state
content = content.replace(
`    material: '',
    weight: '',
    colors: '',
    tags: ''
  });`,
`    material: '',
    weight: '',
    colors: [] as string[],
    tags: [] as string[],
    rating: 0,
    reviewCount: 0
  });`
);

// Replace submit logic
const oldSubmitLogic = `      if (formData.colors) {
        const colorsArr = formData.colors.split(',').map(c => c.trim()).filter(Boolean);
        colorsArr.forEach(c => submitData.append('colors', c));
      }
      
      if (formData.tags) {
        const tagsArr = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
        tagsArr.forEach(t => submitData.append('tags', t));
      }`;

const newSubmitLogic = `      if (formData.colors && formData.colors.length > 0) {
        formData.colors.forEach(c => submitData.append('colors', c));
      }
      
      if (formData.tags && formData.tags.length > 0) {
        formData.tags.forEach(t => submitData.append('tags', t));
      }
      
      submitData.append('rating', formData.rating.toString());
      submitData.append('reviewCount', formData.reviewCount.toString());`;

content = content.replace(oldSubmitLogic, newSubmitLogic);

// Replace UI inputs
const oldUI = `              <div className="space-y-2">
                <label className="text-sm font-semibold text-burgundy">Colors (comma separated)</label>
                <input 
                  type="text" 
                  value={formData.colors}
                  onChange={(e) => setFormData(prev => ({...prev, colors: e.target.value}))}
                  className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors"
                  placeholder="e.g. Gold, Rose Gold, Silver"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-burgundy">Tags (comma separated)</label>
                <input 
                  type="text" 
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({...prev, tags: e.target.value}))}
                  className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors"
                  placeholder="e.g. minimalist, trendy, classic"
                />
              </div>`;

const newUI = `              <div className="space-y-2 md:col-span-2">
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
                      className={\`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border \${formData.colors.includes(color) ? 'bg-burgundy text-white border-burgundy' : 'bg-ivory/30 text-burgundy/70 border-burgundy/20 hover:border-burgundy/50 hover:bg-ivory'}\`}
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
                      className={\`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border \${formData.tags.includes(tag) ? 'bg-burgundy text-white border-burgundy' : 'bg-ivory/30 text-burgundy/70 border-burgundy/20 hover:border-burgundy/50 hover:bg-ivory'}\`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-burgundy">Rating (0-5)</label>
                <input 
                  type="number" 
                  min="0"
                  max="5"
                  step="0.1"
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
                  value={formData.reviewCount}
                  onChange={(e) => setFormData(prev => ({...prev, reviewCount: Number(e.target.value)}))}
                  className="w-full bg-white border border-burgundy/20 rounded-xl px-4 py-2 font-body text-sm text-burgundy outline-none focus:border-burgundy/50 transition-colors"
                />
              </div>`;

content = content.replace(oldUI, newUI);

fs.writeFileSync('src/app/admin/products/new/page.tsx', content);
console.log('Done replacing Add Product Page');
