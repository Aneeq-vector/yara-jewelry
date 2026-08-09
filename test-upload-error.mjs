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

  // Create a dummy image
  const formData = new FormData();
  const blob = new Blob(['dummy image content'], { type: 'image/jpeg' });
  formData.append('images', blob, 'dummy.jpg');

  try {
    const res1 = await fetch(`https://pb.yarasl.shop/api/collections/products/records/${p.id}`, {
      method: 'PATCH',
      headers: { 'Authorization': token },
      body: formData
    });
    const json1 = await res1.json();
    console.log(JSON.stringify(json1, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();
