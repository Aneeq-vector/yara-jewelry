const PocketBase = require('pocketbase/cjs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
  const pb = new PocketBase('http://127.0.0.1:8090');
  
  await pb.admins.authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD);
  
  try {
    const collection = await pb.collections.getOne('users');
    
    // Check if status field already exists
    const hasStatus = collection.fields.some(field => field.name === 'status');
    if (hasStatus) {
      console.log('Status field already exists!');
      return;
    }

    collection.fields.push({
      name: 'status',
      type: 'select',
      required: false,
      options: {
        maxSelect: 1,
        values: ['Active', 'Inactive']
      }
    });

    await pb.collections.update('users', collection);
    console.log('Successfully added status field to users collection!');
  } catch (err) {
    console.error('Error updating schema:', err);
  }
}

main();
