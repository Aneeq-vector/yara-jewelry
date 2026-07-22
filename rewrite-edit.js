const fs = require('fs');
let content = fs.readFileSync('src/app/admin/products/page.tsx', 'utf8');

// 1. Add imports
content = content.replace(
  "import { updateProductDetailsAction } from '@/app/actions/products';",
  "import { updateProductDetailsAction, updateProductWithFilesAction } from '@/app/actions/products';\nimport { Upload } from 'lucide-react';"
);

// 2. Add state variables for images
content = content.replace(
  "const [isSaving, setIsSaving] = useState(false);",
  "const [isSaving, setIsSaving] = useState(false);\n  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);\n  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);"
);

// 3. Update handleEdit
content = content.replace(
  "    setEditingProduct({ ...product, description: cleanDescription });\n  };",
  "    setEditingProduct({ ...product, description: cleanDescription, colors: product.colors || [], tags: product.tags || [] });\n    setNewImageFiles([]);\n    setNewImagePreviews([]);\n  };"
);

// 4. Add Image Handler functions inside ProductsManager
content = content.replace(
  "  const handleSave = async () => {",
  `  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setNewImageFiles(prev => [...prev, ...filesArray]);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {`
);

// 5. Update handleSave logic to use FormData
const oldHandleSaveBody = `      // Find category ID
      const categoryId = categories.find(c => c.name === editingProduct.category)?.id || editingProduct.category;
      
      const payload = {
        name: editingProduct.name,
        price: editingProduct.price,
        originalPrice: editingProduct.originalPrice,
        category: categoryId,
        inStock: editingProduct.inStock,
        badge: editingProduct.badge,
        shortDescription: editingProduct.shortDescription,
        description: editingProduct.description.startsWith('<p>') ? editingProduct.description : \`<p>\${editingProduct.description}</p>\`,
        material: editingProduct.material,
        weight: editingProduct.weight,
      };

      const res = await updateProductDetailsAction(editingProduct.id, payload);`;

const newHandleSaveBody = `      const categoryId = categories.find(c => c.name === editingProduct.category)?.id || editingProduct.category;
      
      const submitData = new FormData();
      submitData.append('name', editingProduct.name);
      if (editingProduct.price !== undefined) submitData.append('price', editingProduct.price.toString());
      if (editingProduct.originalPrice !== undefined) submitData.append('originalPrice', editingProduct.originalPrice.toString());
      if (categoryId) submitData.append('category', categoryId);
      if (editingProduct.inStock !== undefined) submitData.append('inStock', editingProduct.inStock.toString());
      if (editingProduct.badge) submitData.append('badge', editingProduct.badge);
      if (editingProduct.shortDescription) submitData.append('shortDescription', editingProduct.shortDescription);
      
      const desc = editingProduct.description.startsWith('<p>') ? editingProduct.description : \`<p>\${editingProduct.description}</p>\`;
      submitData.append('description', desc);
      
      if (editingProduct.material) submitData.append('material', editingProduct.material);
      if (editingProduct.weight) submitData.append('weight', editingProduct.weight);
      if (editingProduct.rating !== undefined) submitData.append('rating', editingProduct.rating.toString());
      if (editingProduct.reviewCount !== undefined) submitData.append('reviewCount', editingProduct.reviewCount.toString());
      
      if (editingProduct.colors && editingProduct.colors.length > 0) {
        editingProduct.colors.forEach(c => submitData.append('colors', c));
      }
      
      if (editingProduct.tags && editingProduct.tags.length > 0) {
        editingProduct.tags.forEach(t => submitData.append('tags', t));
      }
      
      newImageFiles.forEach(file => {
        submitData.append('images', file);
      });

      const res = await updateProductWithFilesAction(editingProduct.id, submitData);`;

content = content.replace(oldHandleSaveBody, newHandleSaveBody);

// 6. Add UI for Colors, Tags, Rating, ReviewCount, Images before the badge
const marker = `                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Badge</label>`;

const newUIFields = `                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-burgundy">Colors</label>
                  <div className="flex flex-wrap gap-2">
                    {["Gold", "Silver", "Rose Gold", "Platinum", "Black"].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          const currentColors = editingProduct.colors || [];
                          setEditingProduct(prev => prev ? ({
                            ...prev,
                            colors: currentColors.includes(color) 
                              ? currentColors.filter(c => c !== color)
                              : [...currentColors, color]
                          }) : null);
                        }}
                        className={\`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border \${(editingProduct.colors || []).includes(color) ? 'bg-burgundy text-white border-burgundy' : 'bg-ivory/30 text-burgundy/70 border-burgundy/20 hover:border-burgundy/50 hover:bg-ivory'}\`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-burgundy">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {["necklace", "gold", "minimalist", "earrings", "rings", "bracelets", "silver", "diamonds", "pearls", "bestseller", "new", "sale", "trendy", "classic", "bridal"].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const currentTags = editingProduct.tags || [];
                          setEditingProduct(prev => prev ? ({
                            ...prev,
                            tags: currentTags.includes(tag) 
                              ? currentTags.filter(t => t !== tag)
                              : [...currentTags, tag]
                          }) : null);
                        }}
                        className={\`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border \${(editingProduct.tags || []).includes(tag) ? 'bg-burgundy text-white border-burgundy' : 'bg-ivory/30 text-burgundy/70 border-burgundy/20 hover:border-burgundy/50 hover:bg-ivory'}\`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Rating (0-5)</label>
                  <input 
                    type="number" 
                    min="0"
                    max="5"
                    step="0.1"
                    value={editingProduct.rating || 0}
                    onChange={(e) => setEditingProduct({...editingProduct, rating: Number(e.target.value)})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-burgundy/60 mb-2 font-ui uppercase tracking-wider">Review Count</label>
                  <input 
                    type="number" 
                    min="0"
                    value={editingProduct.reviewCount || 0}
                    onChange={(e) => setEditingProduct({...editingProduct, reviewCount: Number(e.target.value)})}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-burgundy">Add Images</label>
                  <div className="flex gap-4 items-center">
                    <label className="cursor-pointer bg-white border border-dashed border-burgundy/30 hover:border-burgundy/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors flex-1">
                      <Upload size={24} className="text-burgundy/50" />
                      <span className="text-sm text-burgundy/60 font-medium">Click to upload additional images</span>
                      <input 
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {newImagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mt-4">
                      {newImagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-burgundy/10">
                          <img src={preview} alt="preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removeNewImage(idx)}
                            className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

` + marker;

content = content.replace(marker, newUIFields);

fs.writeFileSync('src/app/admin/products/page.tsx', content);
console.log('Done rewriting edit modal');
