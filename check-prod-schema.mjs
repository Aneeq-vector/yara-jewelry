import PocketBase from 'pocketbase';

async function checkProdSchema() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  const col = await pb.collections.getOne('products');
  console.log(JSON.stringify(col.fields.find(f => f.name === 'images'), null, 2));
}

checkProdSchema();
