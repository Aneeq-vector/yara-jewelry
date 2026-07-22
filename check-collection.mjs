import PocketBase from 'pocketbase';

async function checkCollection() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  const collection = await pb.collections.getOne('addresses');
  console.log("Collection schema/fields:", JSON.stringify(collection.schema || collection.fields, null, 2));
}

checkCollection();
