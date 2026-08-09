import 'dotenv/config';
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb.yarasl.shop');

async function test() {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
  
  if (!adminEmail) {
    console.log("No env");
    return;
  }
  
  await pb.admins.authWithPassword(adminEmail, adminPassword);
  console.log("Logged in");
  
  // Try to fetch a product
  const products = await pb.collection('products').getList(1, 1);
  if (products.items.length === 0) return console.log("No products");
  
  const p = products.items[0];
  console.log("Testing update on:", p.id, p.name);
  
  const payload = {
    name: p.name + " Test",
    price: p.price,
    originalPrice: p.originalPrice,
    category: p.category,
    inStock: p.inStock,
    badge: p.badge || '',
    shortDescription: p.shortDescription || '',
    description: p.description,
    material: p.material || '',
    weight: p.weight || '',
    rating: p.rating || 0,
    reviewCount: p.reviewCount || 0,
    colors: p.colors || [],
    tags: p.tags || [],
  };
  
  try {
    const res = await pb.collection('products').update(p.id, payload);
    console.log("Success!");
    
    // revert
    await pb.collection('products').update(p.id, { name: p.name });
  } catch (err) {
    console.error("Error updating:", err.response?.data || err);
  }
}

test();
