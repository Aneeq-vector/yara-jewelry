import PocketBase from 'pocketbase';

async function main() {
  const pb = new PocketBase('http://localhost:8090');
  
  console.log('Authenticating as admin...');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');

  // 1. Get a user for relations
  const users = await pb.collection('users').getList(1, 1, { filter: 'role="customer"' });
  let customerId = '';
  if (users.items.length > 0) {
    customerId = users.items[0].id;
  } else {
    const allUsers = await pb.collection('users').getList(1, 1);
    if (allUsers.items.length > 0) customerId = allUsers.items[0].id;
  }
  
  if (!customerId) {
    console.log("No users found to associate with orders/wishlist. Please create a user first.");
    return;
  }

  console.log('Clearing existing wishlist items...');
  const existingWishlists = await pb.collection('wishlist').getFullList();
  for (const w of existingWishlists) {
    await pb.collection('wishlist').delete(w.id);
  }

  console.log('Clearing existing orders...');
  const existingOrders = await pb.collection('orders').getFullList();
  for (const ord of existingOrders) {
    await pb.collection('orders').delete(ord.id);
  }

  console.log('Clearing existing products...');
  const existingProducts = await pb.collection('products').getFullList();
  for (const prod of existingProducts) {
    await pb.collection('products').delete(prod.id);
  }

  console.log('Clearing existing categories...');
  const existingCategories = await pb.collection('categories').getFullList();
  for (const cat of existingCategories) {
    await pb.collection('categories').delete(cat.id);
  }

  console.log('Creating 3 categories...');
  const cat1 = await pb.collection('categories').create({
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Elegant necklaces for every occasion.',
    image: '/images/mock-imgs/necklaces.jpg',
    productCount: 15
  });
  const cat2 = await pb.collection('categories').create({
    name: 'Rings',
    slug: 'rings',
    description: 'Beautiful rings crafted with perfection.',
    image: '/images/mock-imgs/rings.jpg',
    productCount: 24
  });
  const cat3 = await pb.collection('categories').create({
    name: 'Earrings',
    slug: 'earrings',
    description: 'Stunning earrings to match your style.',
    image: '/images/mock-imgs/earrings.jpg',
    productCount: 12
  });

  // 3. Create 3 Products
  console.log('Creating 3 products...');
  try {
    const prod1 = await pb.collection('products').create({
    name: 'Diamond Solitaire Ring',
    slug: 'diamond-solitaire-ring',
    price: 45000,
    originalPrice: 55000,
    description: '<p>A stunning diamond solitaire ring featuring a brilliant cut diamond set in 18k white gold.</p>',
    shortDescription: 'Classic diamond solitaire in 18k white gold.',
    category: cat2.id,
    // images: ['/images/mock-imgs/rings.jpg'], // File upload requires FormData
    badge: 'best-seller',
    rating: 4.8,
    reviewCount: 124,
    material: '18k White Gold, Diamond',
    weight: '3.5g',
    inStock: true
  });

  const prod2 = await pb.collection('products').create({
    name: 'Pearl Drop Earrings',
    slug: 'pearl-drop-earrings',
    price: 12500,
    originalPrice: 0,
    description: '<p>Elegant freshwater pearl drop earrings, perfect for both casual and formal wear.</p>',
    shortDescription: 'Freshwater pearl drop earrings.',
    category: cat3.id,
    // images: ['/images/mock-imgs/earrings.jpg'], // File upload requires FormData
    badge: 'new',
    rating: 4.5,
    reviewCount: 56,
    material: 'Sterling Silver, Freshwater Pearl',
    weight: '2.1g',
    inStock: true
  });

  const prod3 = await pb.collection('products').create({
    name: 'Gold Chain Necklace',
    slug: 'gold-chain-necklace',
    price: 32000,
    originalPrice: 38000,
    description: '<p>A delicate and versatile 14k gold chain necklace, an essential piece for layering.</p>',
    shortDescription: 'Delicate 14k gold chain necklace.',
    category: cat1.id,
    // images: ['/images/mock-imgs/necklaces.jpg'], // File upload requires FormData
    badge: 'trending',
    rating: 4.9,
    reviewCount: 210,
    material: '14k Gold',
    weight: '4.8g',
    inStock: true
    });

    // 4. Create 3 Orders
    console.log('Creating 3 orders...');
    await pb.collection('orders').create({
      user: customerId,
      items: [prod1.id],
      totalAmount: 45000,
      status: 'pending',
      shippingName: 'John Doe',
      shippingStreet: '123 Main St',
      shippingCity: 'Colombo',
      shippingZip: '00100',
      shippingCountry: 'Sri Lanka',
      paymentStatus: 'paid'
    });

    await pb.collection('orders').create({
      user: customerId,
      items: [prod2.id],
      totalAmount: 25000,
      status: 'shipped',
      shippingName: 'Jane Smith',
      shippingStreet: '456 Oak Rd',
      shippingCity: 'Kandy',
      shippingZip: '20000',
      shippingCountry: 'Sri Lanka',
      paymentStatus: 'paid'
    });

    await pb.collection('orders').create({
      user: customerId,
      items: [prod3.id, prod2.id],
      totalAmount: 44500,
      status: 'delivered',
      shippingName: 'Alice Brown',
      shippingStreet: '789 Pine Ln',
      shippingCity: 'Galle',
      shippingZip: '80000',
      shippingCountry: 'Sri Lanka',
      paymentStatus: 'paid'
    });

    // 5. Create 3 Wishlist Items
    console.log('Creating 3 wishlist items...');
    await pb.collection('wishlist').create({ user: customerId, product: prod1.id });
    await pb.collection('wishlist').create({ user: customerId, product: prod2.id });
    await pb.collection('wishlist').create({ user: customerId, product: prod3.id });

    console.log('Successfully created 3 mock items for all collections!');
  } catch (e) {
    console.log("Error:", JSON.stringify(e.response, null, 2));
  }
}

main().catch(console.error);
