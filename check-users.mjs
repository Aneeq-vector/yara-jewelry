import PocketBase from 'pocketbase';

async function checkUsers() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  try {
    const users = await pb.collection('users').getFullList();
    console.log('Users:', users.map(u => ({ id: u.id, email: u.email })));
  } catch (e) {
    console.log('users collection error:', e.message);
  }
}

checkUsers();
