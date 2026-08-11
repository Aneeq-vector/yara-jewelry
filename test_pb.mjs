import 'dotenv/config';
import PocketBase from 'pocketbase';
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
try {
  const records = await pb.collection('products').getList(1, 1, {
    expand: 'category'
  });
  console.log("SUCCESS:", records.totalItems);
} catch (e) {
  console.error("ERROR:", e.message);
}
