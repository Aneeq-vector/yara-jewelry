import 'dotenv/config';
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb.yarasl.shop');

async function test() {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
  
  await pb.admins.authWithPassword(adminEmail, adminPassword);
  
  const products = await pb.collection('products').getList(1, 1);
  const p = products.items[0];
  const token = pb.authStore.token;

  console.log("Current images:", p.images);
  
  const formData = new FormData();
  // Append existing files to retain them
  if (p.images && p.images.length > 0) {
    formData.append('images', p.images[0]);
  }
  
  // Append a new file
  const blob = new Blob(['dummy'], { type: 'image/jpeg' });
  formData.append('images', blob, 'test-new.jpg');
  
  try {
    const res1 = await fetch(`https://pb.yarasl.shop/api/collections/products/records/${p.id}`, {
      method: 'PATCH',
      headers: { 'Authorization': token },
      body: formData
    });
    const json = await res1.json();
    console.log('After PATCH:', json.images);
  } catch (err) {
    console.error(err);
  }
}

test();
