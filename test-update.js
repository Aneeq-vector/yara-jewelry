const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('http://localhost:8090');

async function run() {
  try {
    await pb.collection('users').authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
    console.log('User authenticated as:', pb.authStore.model.email);
    
    const product = await pb.collection('products').getFirstListItem('');
    console.log('Found product:', product.id);
    
    const updated = await pb.collection('products').update(product.id, {
      name: product.name + ' test'
    });
    console.log('Update successful:', updated.id);
  } catch(e) {
    console.error('Update failed. Status:', e.status);
    console.error('Data:', JSON.stringify(e.response, null, 2));
  }
}

run();
