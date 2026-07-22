const fs = require('fs');
let content = fs.readFileSync('src/app/admin/products/page.tsx', 'utf8');

const oldCategory = `                  <select 
                    value={categories.find(c => c.name === editingProduct.category)?.id || editingProduct.category || ''}
                    onChange={(e) => {
                      const selectedName = categories.find(c => c.id === e.target.value)?.name || '';
                      setEditingProduct({...editingProduct, category: selectedName as any});
                    }}
                    className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>`;

const newCategory = `                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full flex justify-between items-center bg-ivory/30 border border-burgundy/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors cursor-pointer data-[state=open]:border-burgundy/30">
                      <span>{editingProduct.category || 'Select Category'}</span>
                      <ChevronDown size={16} className="opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      className="w-(--anchor-width) min-w-[200px] bg-white border border-burgundy/10 shadow-lg shadow-burgundy/5 rounded-xl p-1 z-[100]"
                    >
                      <DropdownMenuItem 
                        onClick={() => setEditingProduct({...editingProduct, category: '' as any})}
                        className="cursor-pointer px-3 py-2.5 text-sm text-burgundy/60 hover:bg-burgundy/5 rounded-lg transition-colors focus:bg-burgundy/10 focus:text-burgundy"
                      >
                        Select Category
                      </DropdownMenuItem>
                      {categories.map(c => (
                        <DropdownMenuItem 
                          key={c.id} 
                          onClick={() => setEditingProduct({...editingProduct, category: c.name as any})}
                          className="cursor-pointer px-3 py-2.5 text-sm font-medium text-burgundy hover:bg-burgundy/5 rounded-lg transition-colors focus:bg-burgundy/10 focus:text-burgundy"
                        >
                          {c.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>`;

content = content.replace(oldCategory, newCategory);

fs.writeFileSync('src/app/admin/products/page.tsx', content);
console.log('Done replacing category');
