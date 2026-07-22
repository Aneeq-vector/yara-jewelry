import PocketBase from 'pocketbase';

async function main() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  console.log('Fetching existing products to backup data...');
  const products = await pb.collections.getOne('products');
  const allProducts = await pb.collection('products').getFullList({ batch: 200 });
  
  const backupData = new Map();
  const uniqueBadges = new Set(['trending', 'best-seller', 'limited', 'new']);

  allProducts.forEach(p => {
    backupData.set(p.id, { badge: p.badge || '' });
    if (p.badge) uniqueBadges.add(p.badge);
  });
  
  const badgeField = products.fields.find(f => f.name === 'badge');
  
  if (!badgeField || badgeField.type === 'select') {
      console.log('Field already converted or missing.');
      return;
  }

  console.log('Removing old badge text field...');
  products.fields = products.fields.filter(f => f.name !== 'badge');
  await pb.collections.update('products', products);
  
  console.log('Adding Select field...');
  products.fields.push({
    name: 'badge',
    type: 'select',
    required: false,
    maxSelect: 1, // badge is single select
    values: Array.from(uniqueBadges)
  });
  
  await pb.collections.update('products', products);
  console.log('Field successfully recreated as Select type.');

  console.log('Restoring data...');
  for (const [id, data] of backupData.entries()) {
    try {
      if (data.badge) {
        await pb.collection('products').update(id, data);
      }
    } catch (e) {
      console.error(`Failed to restore data for product ${id}:`, e.message);
    }
  }
  
  console.log('Data restored successfully! Conversion complete.');
}

main();
