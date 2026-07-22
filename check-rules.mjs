import PocketBase from 'pocketbase';

async function checkRules() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  const collection = await pb.collections.getOne('addresses');
  console.log("Create Rule:", collection.createRule);
  console.log("Update Rule:", collection.updateRule);
}

checkRules();
