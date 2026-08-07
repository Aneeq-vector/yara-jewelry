import { config } from 'dotenv';
config({ path: '.env' });
import PocketBase from 'pocketbase';

async function run() {
  try {
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error('PocketBase admin credentials are not set in .env');
    }

    const pb = new PocketBase('https://pb.yarasl.shop');
    await pb.admins.authWithPassword(adminEmail, adminPassword);
    
    console.log("Authenticated as admin successfully");

    const records = await pb.collection('orders').getFullList({
      sort: '-orderDate',
      expand: 'user,items'
    });
    console.log("Fetched records with -orderDate:", records.length);
  } catch (err: any) {
    console.error("Error:", err.message);
    if (err.response) console.error("Response:", err.response);
  }
}
run();
