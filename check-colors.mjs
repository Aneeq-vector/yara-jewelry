import PocketBase from 'pocketbase';

async function checkColors() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  const products = await pb.collection('products').getFullList();
  
  for (const p of products) {
    if (p.colors && p.colors.length > 0) {
      console.log(`${p.name} has colors:`, p.colors);
    } else {
      console.log(`${p.name} has no colors`);
    }
  }
}

checkColors();
