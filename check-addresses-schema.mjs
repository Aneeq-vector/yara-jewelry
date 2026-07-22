import PocketBase from 'pocketbase';

async function checkAddressesSchema() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  try {
    const addressesCol = await pb.collections.getOne('addresses');
    console.log(JSON.stringify(addressesCol.fields, null, 2));
  } catch (e) {
    console.log('addresses collection error:', e.message);
  }
}

checkAddressesSchema();
