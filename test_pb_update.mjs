import 'dotenv/config';
import PocketBase from 'pocketbase';
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
try {
  await pb.admins.authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD);
  
  // Get first product
  const products = await pb.collection('products').getList(1, 1);
  if (products.items.length === 0) {
    console.log("No products found.");
    process.exit(0);
  }
  
  const product = products.items[0];
  console.log("Found product:", product.id);
  
  // Try to update with empty string for badge
  const fd = new FormData();
  fd.append('name', product.name);
  fd.append('badge', '');
  fd.append('description', 'Test desc');
  
  const updated = await pb.collection('products').update(product.id, fd);
  console.log("Update SUCCESS");
} catch (e) {
  console.error("ERROR:");
  console.error(e.data);
}
