import PocketBase from 'pocketbase';
const pb = new PocketBase('http://localhost:8090');
const records = await pb.collection('products').getList(1, 5);
records.items.forEach(r => {
  console.log(r.name, 'images:', r.images, typeof r.images, Array.isArray(r.images));
});
