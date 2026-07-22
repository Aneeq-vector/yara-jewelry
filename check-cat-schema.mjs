import PocketBase from 'pocketbase';

async function checkCatSchema() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  const col = await pb.collections.getOne('categories');
  console.log("Categories schema:", JSON.stringify(col.fields, null, 2));
}

checkCatSchema();
