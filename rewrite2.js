const fs = require('fs');
let content = fs.readFileSync('src/app/admin/products/page.tsx', 'utf8');

content = content.replace(
  "import { createClient } from '@/lib/pocketbase';",
  "import { createClient } from '@/lib/pocketbase';\nimport { updateProductDetailsAction } from '@/app/actions/products';"
);

const oldSaveBlock = `      const pb = createClient();
      // Find category ID
      const categoryId = categories.find(c => c.name === editingProduct.category)?.id || editingProduct.category;
      
      await pb.collection('products').update(editingProduct.id, {
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
      });`;

const newSaveBlock = `      // Find category ID
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

      const res = await updateProductDetailsAction(editingProduct.id, payload);
      if (res.error) {
        throw new Error(res.error);
      }`;

content = content.replace(oldSaveBlock, newSaveBlock);

fs.writeFileSync('src/app/admin/products/page.tsx', content);
console.log('Done rewriting products page');
