import 'dotenv/config';
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb.yarasl.shop');

async function test() {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
  
  await pb.admins.authWithPassword(adminEmail, adminPassword);
  const token = pb.authStore.token;

  const formData = new FormData();
  formData.append('name', 'Test Product');
  formData.append('price', '99.99');
  formData.append('shortDescription', 'Short desc');
  formData.append('description', '<p>Full desc</p>');
  
  // Try sending empty string for rating
  formData.append('rating', '');
  
  try {
    const res = await fetch(`https://pb.yarasl.shop/api/collections/products/records`, {
      method: 'POST',
      headers: { 'Authorization': token },
      body: formData
    });
    
    if (!res.ok) {
      console.error("FAILED:", await res.text());
    } else {
      console.log("SUCCESS:", await res.json());
    }
  } catch (err) {
    console.error("FETCH ERROR:", err);
  }
}

test();
