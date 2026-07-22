import PocketBase from 'pocketbase';
const pb = new PocketBase('http://localhost:8090');
await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
const records = await pb.collection('categories').getFullList();
const newArrivals = records.find(r => r.name === 'New Arrivals');
if (newArrivals) {
  await pb.collection('categories').update(newArrivals.id, { slug: 'new-arrivals' });
  console.log('Updated New Arrivals slug to new-arrivals');
}
