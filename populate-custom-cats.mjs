import PocketBase from 'pocketbase';

async function run() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  // 1. Ensure 'image' field exists on 'categories'
  const catCol = await pb.collections.getOne('categories');
  let hasImageField = catCol.fields.some(f => f.name === 'image');
  if (!hasImageField) {
    catCol.fields.push({ name: 'image', type: 'text', required: false });
    await pb.collections.update('categories', catCol);
    console.log("Added 'image' field to categories schema.");
  }
  
  // 2. Fetch existing categories and update their images
  const categories = await pb.collection('categories').getFullList();
  
  for (const cat of categories) {
    let img = '';
    if (cat.name.toLowerCase().includes('necklace')) img = '/images/mock-imgs/necklace/necklace1.jpg';
    if (cat.name.toLowerCase().includes('ring')) img = '/images/mock-imgs/rings/ring1.jpg';
    if (cat.name.toLowerCase().includes('earring')) img = '/images/mock-imgs/earings/earing1.jpg';
    
    if (img) {
      await pb.collection('categories').update(cat.id, { image: img });
      console.log(`Updated existing category ${cat.name} with image ${img}`);
    }
  }
  
  // 3. Create New Categories
  const newCats = [
    { name: 'Anklet', slug: 'anklet', description: 'Beautiful anklets for everyday wear.', image: '/images/mock-imgs/anklet/ankler1.jpg' },
    { name: 'Bracelet', slug: 'bracelet', description: 'Stunning bracelets to adorn your wrists.', image: '/images/mock-imgs/bracelets/bracelet1.jpg' },
    { name: 'Nosepin', slug: 'nosepin', description: 'Elegant nosepins with brilliant cut diamonds.', image: '/images/mock-imgs/nosepins/nosepin1.jpg' },
    { name: 'New Arrivals', slug: 'new-arrivals', description: 'Discover the latest jewelry trends.', image: '/images/mock-imgs/combo/giftbox.jpg' }
  ];
  
  const createdCats = [];
  for (const data of newCats) {
    // Check if it already exists
    let existing;
    try {
      existing = await pb.collection('categories').getFirstListItem(`name="${data.name}"`);
    } catch(e) {}
    
    if (existing) {
      await pb.collection('categories').update(existing.id, data);
      createdCats.push(existing);
      console.log(`Updated existing category: ${data.name}`);
    } else {
      const c = await pb.collection('categories').create(data);
      createdCats.push(c);
      console.log(`Created new category: ${data.name}`);
    }
  }
  
  // 4. Create 1 product for each new category
  const newProds = [
    {
      name: 'Silver Charm Anklet',
      slug: 'silver-charm-anklet',
      price: 8500,
      description: '<p>A delicate silver charm anklet.</p>',
      shortDescription: 'Delicate silver anklet.',
      category: createdCats.find(c => c.name === 'Anklet').id,
      images: ['/images/mock-imgs/anklet/anklet2.jpg'],
      badge: 'new',
      inStock: true
    },
    {
      name: 'Gold Tennis Bracelet',
      slug: 'gold-tennis-bracelet',
      price: 55000,
      description: '<p>A classic gold tennis bracelet.</p>',
      shortDescription: 'Classic gold tennis bracelet.',
      category: createdCats.find(c => c.name === 'Bracelet').id,
      images: ['/images/mock-imgs/bracelets/bracelet2.jpg'],
      badge: 'best-seller',
      inStock: true
    },
    {
      name: 'Diamond Solitaire Nosepin',
      slug: 'diamond-solitaire-nosepin',
      price: 15000,
      description: '<p>A brilliant cut diamond nosepin.</p>',
      shortDescription: 'Brilliant diamond nosepin.',
      category: createdCats.find(c => c.name === 'Nosepin').id,
      images: ['/images/mock-imgs/nosepins/nosepin2.jpg'],
      inStock: true
    },
    {
      name: 'Exclusive New Arrival Piece',
      slug: 'exclusive-new-arrival-piece',
      price: 45000,
      description: '<p>The newest addition to our collection.</p>',
      shortDescription: 'Exclusive new jewelry.',
      category: createdCats.find(c => c.name === 'New Arrivals').id,
      images: ['/images/mock-imgs/combo/anniversarybox.jpg'],
      badge: 'new',
      inStock: true
    }
  ];
  
  for (const prodData of newProds) {
    let existing;
    try {
      existing = await pb.collection('products').getFirstListItem(`name="${prodData.name}"`);
    } catch(e) {}
    
    if (existing) {
      console.log(`Product ${prodData.name} already exists.`);
    } else {
      await pb.collection('products').create(prodData);
      console.log(`Created product: ${prodData.name}`);
    }
  }
  
  console.log('All done!');
}

run().catch(console.error);
