with open('src/app/yara-admin/gift-boxes/page.tsx', 'r') as f:
    lines = f.readlines()

editor_lines = lines[362:600]
editor_str = ''.join(editor_lines)

# Find where to put it
# Right above GiftBoxSelector
for i, line in enumerate(lines):
    if line.startswith('function GiftBoxSelector'):
        insert_idx = i
        break

component_str = """
function GiftBoxEditor({
  selectedBox, isActive, previewUrl, fileInputRef, handleImageChange, pendingImage,
  editorCategory, categories, productSearch, filteredProducts, selectedItems, toggleItem,
  saveStatus, handleSave, dispatch
}: any) {
  return (
""" + editor_str + """
  );
}
"""

new_lines = lines[:362] + ["""        <GiftBoxEditor 
          selectedBox={selectedBox} isActive={isActive} previewUrl={previewUrl}
          fileInputRef={fileInputRef} handleImageChange={handleImageChange} pendingImage={pendingImage}
          editorCategory={editorCategory} categories={categories} productSearch={productSearch}
          filteredProducts={filteredProducts} selectedItems={selectedItems} toggleItem={toggleItem}
          saveStatus={saveStatus} handleSave={handleSave} dispatch={dispatch}
        />\n"""] + lines[600:]

new_lines.insert(insert_idx, component_str)

with open('src/app/yara-admin/gift-boxes/page.tsx', 'w') as f:
    f.writelines(new_lines)

