import { config } from 'dotenv';
config({ path: '.env' });
import PocketBase from 'pocketbase';
const pb = new PocketBase('https://pb.yarasl.shop');

async function run() {
  await pb.admins.authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL!, process.env.POCKETBASE_ADMIN_PASSWORD!);
  
  const token = pb.authStore.token;
  const model = pb.authStore.record;
  
  const pb3 = new PocketBase('https://pb.yarasl.shop');
  const rawJSON = JSON.stringify({ token, model });
  const encodedJSON = encodeURIComponent(rawJSON);
  
  pb3.authStore.loadFromCookie(`pb_admin_auth=${encodedJSON}`, 'pb_admin_auth');
  
  console.log("Token exists?", !!pb3.authStore.token);
  console.log("Model exists?", !!pb3.authStore.record);
  console.log("isValid:", pb3.authStore.isValid);
}
run();
