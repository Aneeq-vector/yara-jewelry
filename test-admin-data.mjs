import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  try {
    await pb.admins.authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL,
      process.env.POCKETBASE_ADMIN_PASSWORD
    );
    console.log("Admin auth successful");
    
    try {
      const ordersRes = await pb.collection('orders').getList(1, 5, {
        expand: 'user',
        sort: '-orderDate'
      });
      console.log("Orders:", ordersRes.totalItems);
    } catch (e) {
      console.error("Orders query failed:", e.message);
    }
    
    try {
      const productsRes = await pb.collection('products').getList(1, 4, { sort: '-reviewCount' });
      console.log("Products:", productsRes.totalItems);
    } catch (e) {
      console.error("Products query failed:", e.message);
    }

    try {
      const usersRes = await pb.collection('users').getList(1, 1);
      console.log("Users:", usersRes.totalItems);
    } catch (e) {
      console.error("Users query failed:", e.message);
    }
  } catch(e) {
    console.error("Auth failed:", e.message);
  }
}

test();
