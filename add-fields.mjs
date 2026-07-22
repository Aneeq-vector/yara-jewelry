import PocketBase from 'pocketbase';

async function main() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  const products = await pb.collections.getOne('products');
  
  const uniqueColors = ['Gold', 'Silver', 'Rose Gold', 'Platinum', 'Black'];
  const uniqueTags = ['necklace', 'gold', 'minimalist', 'earrings', 'rings', 'bracelets', 'silver', 'diamonds', 'pearls', 'bestseller', 'new', 'sale', 'trendy', 'classic', 'bridal'];

  console.log('Adding Select fields...');
  
  products.fields.push({
    name: 'colors',
    type: 'select',
    required: false,
    maxSelect: uniqueColors.length,
    values: uniqueColors
  });
  
  products.fields.push({
    name: 'tags',
    type: 'select',
    required: false,
    maxSelect: uniqueTags.length,
    values: uniqueTags
  });
  
  try {
    await pb.collections.update('products', products);
    console.log('Fields successfully added as Select type.');
  } catch (e) {
    console.error('Error adding fields:', e.response ? JSON.stringify(e.response, null, 2) : e);
  }
}

main();
