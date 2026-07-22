import PocketBase from 'pocketbase';
import 'dotenv/config';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090';
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

async function setupUsers() {
  const pb = new PocketBase(PB_URL);

  try {
    console.log('Authenticating as admin...');
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    
    console.log('Fetching users collection...');
    const usersCollection = await pb.collections.getOne('users');
    
    // Check if role field exists
    const hasRole = usersCollection.fields.some(field => field.name === 'role');
    
    if (!hasRole) {
      console.log('Adding "role" field to users collection schema...');
      usersCollection.fields.push({
        system: false,
        name: 'role',
        type: 'select',
        required: true,
        presentable: false,
        maxSelect: 1,
        values: ['admin', 'customer']
      });
      
      await pb.collections.update('users', usersCollection);
      console.log('Schema updated successfully.');
    } else {
      console.log('"role" field already exists in schema.');
    }
    
    // Create Admin User
    try {
      console.log('Creating Admin user...');
      await pb.collection('users').create({
        email: 'admin@yara.com',
        password: 'password123',
        passwordConfirm: 'password123',
        name: 'Yara Admin',
        role: 'admin',
        emailVisibility: true,
      });
      console.log('Admin user created successfully (admin@yara.com / password123)');
    } catch (e) {
      console.log('Admin user might already exist or failed:', e.message);
    }
    
    // Create Customer User
    try {
      console.log('Creating Customer user...');
      await pb.collection('users').create({
        email: 'customer@yara.com',
        password: 'password123',
        passwordConfirm: 'password123',
        name: 'Yara Customer',
        role: 'customer',
        emailVisibility: true,
      });
      console.log('Customer user created successfully (customer@yara.com / password123)');
    } catch (e) {
      console.log('Customer user might already exist or failed:', e.message);
    }
    
    console.log('Setup complete!');
  } catch (error) {
    console.error('Error setting up users:', error);
  }
}

setupUsers();
