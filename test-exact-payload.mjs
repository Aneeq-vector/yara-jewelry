import 'dotenv/config';
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb.yarasl.shop');

async function test() {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
  
  await pb.admins.authWithPassword(adminEmail, adminPassword);
  
  const products = await pb.collection('products').getList(1, 1);
  const p = products.items[0];
  
  const payload = {
    name: p.name + " Test2",
    price: null,
    originalPrice: null,
    category: p.category || '',
    inStock: true,
    badge: '',
    shortDescription: 'test',
    description: '<p>test</p>',
    material: '',
    weight: '',
    rating: 0,
    reviewCount: 0,
    colors: [],
    tags: []
  };

  try {
    const res = await pb.collection('products').update(p.id, payload);
    console.log("UPDATE SUCCESS", res.id);
  } catch (err) {
    console.error("UPDATE ERROR", JSON.stringify(err.response?.data, null, 2));
  }
}

test();
