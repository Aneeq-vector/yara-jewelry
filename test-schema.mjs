import 'dotenv/config';
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb.yarasl.shop');

async function test() {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
  
  await pb.admins.authWithPassword(adminEmail, adminPassword);
  
  const col = await pb.collections.getOne('products');
  console.log(JSON.stringify(col.schema, null, 2));
}

test();
