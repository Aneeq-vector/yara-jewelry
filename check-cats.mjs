import PocketBase from 'pocketbase';

async function fixCategories() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  try {
    const categories = await pb.collection('categories').getFullList();
    console.log(JSON.stringify(categories.map(c => ({ id: c.id, name: c.name, image: c.image })), null, 2));
  } catch (e) {
    console.error(e);
  }
}
fixCategories();
