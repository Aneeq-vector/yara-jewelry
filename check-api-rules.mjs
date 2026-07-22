import PocketBase from 'pocketbase';

async function checkApiRules() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  try {
    const addressesCol = await pb.collections.getOne('addresses');
    console.log('List Rule:', addressesCol.listRule);
    console.log('View Rule:', addressesCol.viewRule);
    console.log('Create Rule:', addressesCol.createRule);
    console.log('Update Rule:', addressesCol.updateRule);
    console.log('Delete Rule:', addressesCol.deleteRule);
  } catch (e) {
    console.log('Error:', e.message);
  }
}

checkApiRules();
