import PocketBase from 'pocketbase';

async function checkUser() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  const users = await pb.collection('users').getList(1, 1, { filter: 'email="laifa@gmail.com"' });
  if (users.items.length > 0) {
    console.log("User data:", users.items[0]);
  } else {
    console.log("User not found");
  }
}

checkUser();
