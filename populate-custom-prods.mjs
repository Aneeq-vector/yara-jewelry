import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  const createdCats = await pb.collection('categories').getFullList();
  
  const newProds = [
    {
      name: 'Silver Charm Anklet',
      slug: 'silver-charm-anklet',
      price: 8500,
      description: '<p>A delicate silver charm anklet.</p>',
      shortDescription: 'Delicate silver anklet.',
      category: createdCats.find(c => c.name === 'Anklet').id,
      images: ['public/images/mock-imgs/anklet/anklet2.jpg'],
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
      images: ['public/images/mock-imgs/bracelets/bracelet2.jpg'],
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
      images: ['public/images/mock-imgs/nosepins/nosepin2.jpg'],
      inStock: true
    },
    {
      name: 'Exclusive New Arrival Piece',
      slug: 'exclusive-new-arrival-piece',
      price: 45000,
      description: '<p>The newest addition to our collection.</p>',
      shortDescription: 'Exclusive new jewelry.',
      category: createdCats.find(c => c.name === 'New Arrivals').id,
      images: ['public/images/mock-imgs/combo/anniversarybox.jpg'],
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
      continue;
    }
    
    const formData = new FormData();
    formData.append('name', prodData.name);
    formData.append('slug', prodData.slug);
    formData.append('price', prodData.price);
    formData.append('description', prodData.description);
    formData.append('shortDescription', prodData.shortDescription);
    formData.append('category', prodData.category);
    if (prodData.badge) formData.append('badge', prodData.badge);
    formData.append('inStock', prodData.inStock);
    
    // Read files and append to formData
    for (const imagePath of prodData.images) {
      const fullPath = path.join(__dirname, imagePath);
      if (fs.existsSync(fullPath)) {
        const buffer = fs.readFileSync(fullPath);
        const filename = path.basename(fullPath);
        formData.append('images', new Blob([buffer]), filename);
      } else {
        console.warn(`Warning: Image not found at ${fullPath}`);
      }
    }
    
    try {
      await pb.collection('products').create(formData);
      console.log(`Created product: ${prodData.name}`);
    } catch(e) {
      console.error(`Error creating ${prodData.name}:`, JSON.stringify(e.response, null, 2));
    }
  }
}

run().catch(console.error);
