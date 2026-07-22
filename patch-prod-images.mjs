import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  const products = await pb.collection('products').getFullList();
  
  const updates = [
    { slug: 'diamond-solitaire-ring', imgPath: 'public/images/mock-imgs/rings/ring1.jpg' },
    { slug: 'pearl-drop-earrings', imgPath: 'public/images/mock-imgs/earings/earing1.jpg' },
    { slug: 'gold-chain-necklace', imgPath: 'public/images/mock-imgs/necklace/necklace1.jpg' }
  ];
  
  for (const update of updates) {
    const prod = products.find(p => p.slug === update.slug);
    if (!prod) {
      console.log(`Product ${update.slug} not found.`);
      continue;
    }
    
    // If it already has images, skip or overwrite?
    // Let's overwrite / add
    if (prod.images && prod.images.length > 0) {
      console.log(`Product ${update.slug} already has images, skipping.`);
      continue;
    }
    
    const fullPath = path.join(__dirname, update.imgPath);
    if (fs.existsSync(fullPath)) {
      const buffer = fs.readFileSync(fullPath);
      const filename = path.basename(fullPath);
      
      const formData = new FormData();
      formData.append('images', new Blob([buffer]), filename);
      
      try {
        await pb.collection('products').update(prod.id, formData);
        console.log(`Successfully uploaded image for ${prod.name}`);
      } catch(e) {
        console.error(`Failed to upload for ${prod.name}:`, JSON.stringify(e.response, null, 2));
      }
    } else {
      console.log(`File not found: ${fullPath}`);
    }
  }
}

run().catch(console.error);
