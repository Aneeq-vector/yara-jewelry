import PocketBase from 'pocketbase';

async function updateUsersSchema() {
  const pb = new PocketBase('http://localhost:8090');
  
  console.log('Authenticating as admin...');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  try {
    const users = await pb.collections.getOne('users');
    
    // Check if phone field exists
    const hasPhone = users.fields.some(f => f.name === 'phone');
    
    if (!hasPhone) {
      users.fields.push({
        name: 'phone',
        type: 'text',
        required: false,
        presentable: false,
        unique: false,
      });
      await pb.collections.update('users', users);
      console.log('Successfully added phone field to users collection.');
    } else {
      console.log('Phone field already exists in users collection.');
    }
  } catch (error) {
    console.error('Error updating schema:', error.response ? JSON.stringify(error.response, null, 2) : error.message);
  }
}

updateUsersSchema();
