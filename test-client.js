import PocketBase from 'pocketbase';

async function main() {
  try {
    const pb = new PocketBase('http://localhost:8090');
    pb.autoCancellation(false);
    const records = await pb.collection('products').getFullList({
      sort: '-created',
    });
    console.log(`Fetched ${records.length} products`);
    
    const cats = await pb.collection('categories').getFullList({
      sort: 'created',
    });
    console.log(`Fetched ${cats.length} categories`);
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
