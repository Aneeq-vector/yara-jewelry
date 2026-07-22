import PocketBase from 'pocketbase';

async function seedAddresses() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  try {
    const users = await pb.collection('users').getFullList();
    
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      // Check if user has addresses
      const existing = await pb.collection('addresses').getList(1, 1, { filter: `user="${u.id}"` });
      if (existing.items.length === 0) {
        await pb.collection('addresses').create({
          user: u.id,
          name: i === 0 ? 'Home' : 'Office',
          street: `${123 + i} Main St`,
          city: 'Colombo',
          state: 'Western',
          zip: '00100',
          phone: `+94 77 123 456${i}`,
          isDefault: true
        });
        console.log(`Added address for user ${u.email}`);
      } else {
        console.log(`User ${u.email} already has addresses`);
      }
    }
  } catch (e) {
    console.log('addresses collection error:', e.message);
  }
}

seedAddresses();
