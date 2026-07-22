const fs = require('fs');
let content = fs.readFileSync('src/app/admin/products/page.tsx', 'utf8');

// 1. Add createClient
content = content.replace(
  "import { formatPrice } from '@/lib/utils';",
  "import { formatPrice } from '@/lib/utils';\nimport { createClient } from '@/lib/pocketbase';"
);

// 2. Add categories state and fetch
content = content.replace(
  "const [editingProduct, setEditingProduct] = useState<Product | null>(null);",
  "const [editingProduct, setEditingProduct] = useState<Product | null>(null);\n  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);\n  const [isSaving, setIsSaving] = useState(false);"
);

content = content.replace(
  "useEffect(() => {\n    getAllProducts().then(setProductList);\n  }, []);",
  `useEffect(() => {\n    getAllProducts().then(setProductList);\n    createClient().collection('categories').getFullList({ sort: 'name' })\n      .then(records => setCategories(records.map(r => ({ id: r.id, name: r.name }))))\n      .catch(console.error);\n  }, []);`
);

// 3. Add handleSave logic
const handleEditRegex = /const handleEdit = \(product: Product\) => {[\s\S]*?};/;
content = content.replace(handleEditRegex, `const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    setIsSaving(true);
    try {
      const pb = createClient();
      await pb.collection('products').update(editingProduct.id, {
        name: editingProduct.name,
        price: editingProduct.price,
        originalPrice: editingProduct.originalPrice,
        category: editingProduct.category,
        inStock: editingProduct.inStock,
        badge: editingProduct.badge,
        shortDescription: editingProduct.shortDescription,
        description: editingProduct.description,
        material: editingProduct.material,
        weight: editingProduct.weight,
        colors: editingProduct.colors ? JSON.stringify(editingProduct.colors) : null,
        tags: editingProduct.tags ? JSON.stringify(editingProduct.tags) : null,
      });
      setProductList(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
      setEditingProduct(null);
    } catch (err) {
      console.error('Failed to update product', err);
      alert('Failed to update product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };`);

// 4. Update the Modal JSX
const modalRegex = /\{\/\* Edit Product Modal \*\/\}[\s\S]*?(?=\n  \);)/;

const newModal = `{/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-burgundy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-xl border border-burgundy/10 flex flex-col max-h-[90vh]">
            <div className="p-6 flex justify-between items-center border-b border-burgundy/10 shrink-0">
              <h2 className="font-heading font-bold text-xl text-burgundy">Edit Product: {editingProduct.productCode}</h2>
              <button onClick={() => setEditingProduct(null)} className="text-burgundy/50 hover:text-burgundy p-2 rounded-full hover:bg-champagne/50 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Product Name</label>
                  <input 
                    type="text" 
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Category</label>
                  <select 
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value as any})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Price (Rs.)</label>
                  <input 
                    type="number" 
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Original Price (Rs.)</label>
                  <input 
                    type="number" 
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, originalPrice: e.target.value ? Number(e.target.value) : undefined})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Short Description</label>
                  <textarea 
                    value={editingProduct.shortDescription || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, shortDescription: e.target.value})}
                    rows={2}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Full Description</label>
                  <textarea 
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    rows={4}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Material</label>
                  <input 
                    type="text" 
                    value={editingProduct.material || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, material: e.target.value})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Weight</label>
                  <input 
                    type="text" 
                    value={editingProduct.weight || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, weight: e.target.value})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Badge</label>
                  <select 
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, badge: (e.target.value || undefined) as any})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">None</option>
                    <option value="trending">Trending</option>
                    <option value="best-seller">Best Seller</option>
                    <option value="new">New Arrival</option>
                    <option value="limited">Limited Edition</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-3 bg-ivory/30 p-4 rounded-xl border border-burgundy/10">
                  <Checkbox 
                    id="inStock"
                    checked={editingProduct.inStock} 
                    onCheckedChange={(checked) => setEditingProduct({...editingProduct, inStock: !!checked})} 
                  />
                  <label htmlFor="inStock" className="text-sm font-semibold text-burgundy cursor-pointer">
                    Product In Stock
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-6 flex justify-end gap-3 border-t border-burgundy/10 bg-ivory/30 shrink-0 rounded-b-3xl">
              <button 
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 font-ui font-semibold text-burgundy/70 hover:text-burgundy transition-colors rounded-xl hover:bg-burgundy/5"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-burgundy text-white px-5 py-2 rounded-xl font-ui text-sm font-semibold hover:bg-wine transition-colors shadow-md shadow-burgundy/20 disabled:opacity-50"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}`;

content = content.replace(modalRegex, newModal);

fs.writeFileSync('src/app/admin/products/page.tsx', content);
console.log('Done replacing!');
