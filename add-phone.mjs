import PocketBase from 'pocketbase';

async function main() {
  const pb = new PocketBase('http://localhost:8090');
  
  console.log('Authenticating as admin...');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  console.log('Fetching users collection...');
  const usersCollection = await pb.collections.getOne('users');
  
  const hasPhone = usersCollection.fields.some(field => field.name === 'phone');
  
  if (!hasPhone) {
    console.log('Adding "phone" field to users collection schema...');
    usersCollection.fields.push({
      system: false,
      name: 'phone',
      type: 'text',
      required: false,
      presentable: false,
      max: 20
    });
    
    await pb.collections.update('users', usersCollection);
    console.log('Schema updated successfully! Added phone field.');
  } else {
    console.log('Phone field already exists in the users schema.');
  }
}

main().catch(console.error);
