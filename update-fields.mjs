import PocketBase from 'pocketbase';

async function main() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  console.log('Fetching existing products to backup data...');
  const products = await pb.collections.getOne('products');
  const allProducts = await pb.collection('products').getFullList({ batch: 200 });
  
  const backupData = new Map();
  const uniqueColors = new Set(['Gold', 'Silver', 'Rose Gold', 'Platinum', 'Black']);
  const uniqueTags = new Set(['necklace', 'gold', 'minimalist', 'earrings', 'rings', 'bracelets', 'silver', 'diamonds', 'pearls', 'bestseller', 'new', 'sale', 'trendy', 'classic', 'bridal']);

  allProducts.forEach(p => {
    backupData.set(p.id, { colors: p.colors || [], tags: p.tags || [] });
    if (Array.isArray(p.colors)) p.colors.forEach(c => uniqueColors.add(c));
    if (Array.isArray(p.tags)) p.tags.forEach(t => uniqueTags.add(t));
  });
  
  const colorsField = products.fields.find(f => f.name === 'colors');
  const tagsField = products.fields.find(f => f.name === 'tags');
  
  if (!colorsField || !tagsField || (colorsField.type === 'select' && tagsField.type === 'select')) {
      console.log('Fields already converted or missing.');
      return;
  }

  console.log('Removing old JSON fields...');
  products.fields = products.fields.filter(f => f.name !== 'colors' && f.name !== 'tags');
  await pb.collections.update('products', products);
  
  console.log('Adding Select fields...');
  products.fields.push({
    name: 'colors',
    type: 'select',
    required: false,
    values: Array.from(uniqueColors),
    maxSelect: 10,
    options: { maxSelect: 10, values: Array.from(uniqueColors) }
  });
  
  products.fields.push({
    name: 'tags',
    type: 'select',
    required: false,
    values: Array.from(uniqueTags),
    maxSelect: 20,
    options: { maxSelect: 20, values: Array.from(uniqueTags) }
  });
  
  await pb.collections.update('products', products);
  console.log('Fields successfully recreated as Select type.');

  console.log('Restoring data...');
  for (const [id, data] of backupData.entries()) {
    try {
      await pb.collection('products').update(id, data);
    } catch (e) {
      console.error(`Failed to restore data for product ${id}:`, e.message);
    }
  }
  
  console.log('Data restored successfully! Conversion complete.');
}

main();
