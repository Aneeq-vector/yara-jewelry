import 'dotenv/config';
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb.yarasl.shop');

async function test() {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
  
  await pb.admins.authWithPassword(adminEmail, adminPassword);
  
  try {
    const categories = await pb.collection('categories').getFullList();
    console.log("Categories:", categories.map(c => ({ id: c.id, name: c.name })));
  } catch (err) {
    console.error("Error fetching categories:", err);
  }
}

test();
