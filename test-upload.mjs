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

  console.log("Uploading with Bearer");
  try {
    const res1 = await fetch(`https://pb.yarasl.shop/api/collections/products/records/${p.id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    console.log("Bearer response:", res1.status);
    const json1 = await res1.json();
    console.log("Bearer JSON:", json1.images?.length);
  } catch (err) {
    console.error(err);
  }

  console.log("Uploading without Bearer");
  try {
    const res2 = await fetch(`https://pb.yarasl.shop/api/collections/products/records/${p.id}`, {
      method: 'PATCH',
      headers: { 'Authorization': token },
      body: formData
    });
    console.log("No Bearer response:", res2.status);
    const json2 = await res2.json();
    console.log("No Bearer JSON:", json2.images?.length);
  } catch (err) {
    console.error(err);
  }
}

test();
