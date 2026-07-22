import PocketBase from 'pocketbase';

async function main() {
  const pb = new PocketBase('http://localhost:8090');
  
  console.log('Authenticating as admin...');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  const addField = (collection, fieldDef) => {
    // Check if field already exists
    const exists = collection.fields.some(f => f.name === fieldDef.name);
    if (!exists) {
      collection.fields.push(fieldDef);
    }
  };

  // 1. Setup Categories Collection
  try {
    console.log('Configuring categories...');
    const categories = await pb.collections.getOne('categories');
    const cFields = [
      { name: 'name', type: 'text', required: true },
      { name: 'slug', type: 'text', required: true },
      { name: 'description', type: 'text', required: false },
      { name: 'image', type: 'text', required: false }, // Store URL or use 'file' type for PB uploads
      { name: 'productCount', type: 'number', required: false }
    ];
    cFields.forEach(f => addField(categories, f));
    await pb.collections.update('categories', categories);
    console.log('Categories updated!');
  } catch (e) {
    console.log('Categories collection might not exist yet.');
  }

  // 2. Setup Products Collection
  try {
    console.log('Configuring products...');
    const products = await pb.collections.getOne('products');
    const categoriesCollectionId = (await pb.collections.getOne('categories')).id;
    const pFields = [
      { name: 'name', type: 'text', required: true },
      { name: 'slug', type: 'text', required: true },
      { name: 'price', type: 'number', required: true },
      { name: 'originalPrice', type: 'number', required: false },
      { name: 'description', type: 'editor', required: true },
      { name: 'shortDescription', type: 'text', required: true },
      { name: 'category', type: 'relation', required: false, collectionId: categoriesCollectionId, cascadeDelete: false, maxSelect: 1 },
      { name: 'images', type: 'json', required: false }, // array of strings
      { name: 'badge', type: 'text', required: false },
      { name: 'rating', type: 'number', required: false },
      { name: 'reviewCount', type: 'number', required: false },
      { name: 'material', type: 'text', required: false },
      { name: 'weight', type: 'text', required: false },
      { name: 'inStock', type: 'bool', required: false },
      { name: 'colors', type: 'json', required: false },
      { name: 'tags', type: 'json', required: false }
    ];
    pFields.forEach(f => addField(products, f));
    await pb.collections.update('products', products);
    console.log('Products updated!');
  } catch (e) {
    console.log('Products collection error:', e.response ? JSON.stringify(e.response, null, 2) : e.message);
  }

  // 3. Setup Orders Collection
  try {
    console.log('Configuring orders...');
    const orders = await pb.collections.getOne('orders');
    const usersCollectionId = (await pb.collections.getOne('users')).id;
    const oFields = [
      { name: 'user', type: 'relation', required: true, collectionId: usersCollectionId, cascadeDelete: false, maxSelect: 1 },
      { name: 'items', type: 'json', required: true }, // CartItem[]
      { name: 'totalAmount', type: 'number', required: true },
      { name: 'status', type: 'select', required: true, values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], maxSelect: 1 },
      { name: 'shippingName', type: 'text', required: true },
      { name: 'shippingStreet', type: 'text', required: true },
      { name: 'shippingCity', type: 'text', required: true },
      { name: 'shippingZip', type: 'text', required: true },
      { name: 'shippingCountry', type: 'text', required: true },
      { name: 'paymentStatus', type: 'select', required: true, values: ['pending', 'paid', 'failed'], maxSelect: 1 }
    ];
    oFields.forEach(f => addField(orders, f));
    await pb.collections.update('orders', orders);
    console.log('Orders updated!');
  } catch (e) {
    console.log('Orders collection error:', e.response ? JSON.stringify(e.response, null, 2) : e.message);
  }

  // 4. Setup Wishlist Collection
  try {
    console.log('Configuring wishlist...');
    const wishlist = await pb.collections.getOne('wishlist');
    const usersCollectionId = (await pb.collections.getOne('users')).id;
    const productsCollectionId = (await pb.collections.getOne('products')).id;
    const wFields = [
      { name: 'user', type: 'relation', required: true, collectionId: usersCollectionId, cascadeDelete: true, maxSelect: 1 },
      { name: 'product', type: 'relation', required: true, collectionId: productsCollectionId, cascadeDelete: true, maxSelect: 1 }
    ];
    wFields.forEach(f => addField(wishlist, f));
    await pb.collections.update('wishlist', wishlist);
    console.log('Wishlist updated!');
  } catch (e) {
    console.log('Wishlist collection error:', e.response ? JSON.stringify(e.response, null, 2) : e.message);
  }

  console.log('All collections configured successfully!');
}

main().catch(console.error);
