import PocketBase from 'pocketbase';

async function main() {
  const pb = new PocketBase('http://localhost:8090');
  
  console.log('Authenticating as admin...');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');

  // 1. Update Categories
  try {
    console.log('Updating categories schema to support file uploads...');
    const categories = await pb.collections.getOne('categories');
    
    // Remove old 'image' field if it's text/json
    categories.fields = categories.fields.filter(f => f.name !== 'image');
    
    // Add new 'image' file field
    categories.fields.push({
      name: 'image',
      type: 'file',
      required: false,
      maxSelect: 1,
      maxSize: 5242880, // 5MB
      mimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp']
    });
    
    await pb.collections.update('categories', categories);
    console.log('Categories updated!');
  } catch (e) {
    console.log('Error updating categories:', e.response || e.message);
  }

  // 2. Update Products
  try {
    console.log('Updating products schema to support file uploads...');
    const products = await pb.collections.getOne('products');
    
    // Remove old 'images' field if it's text/json
    products.fields = products.fields.filter(f => f.name !== 'images');
    
    // Add new 'images' file field
    products.fields.push({
      name: 'images',
      type: 'file',
      required: false,
      maxSelect: 10,
      maxSize: 5242880, // 5MB
      mimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp']
    });
    
    await pb.collections.update('products', products);
    console.log('Products updated!');
  } catch (e) {
    console.log('Error updating products:', e.response || e.message);
  }

  console.log('Done! You can now upload local image files in PocketBase.');
}

main().catch(console.error);
