import pbPkg from 'pocketbase';
const PocketBase = pbPkg.default || pbPkg;
import fs from 'fs';

const envs = fs.readFileSync('.env', 'utf8').split('\n');
for (const line of envs) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
}

async function check() {
  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');
    await pb.admins.authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD);
    
    const records = await pb.collection('orders').getFullList({ sort: '-created' });
    const r = records[0];
    
    try {
      await pb.collection('orders').update(r.id, { status: 'processing' });
      console.log('Update worked!');
    } catch(e) {
      console.log('Update Error Status:', e.status);
      console.log('Update Error Data:', JSON.stringify(e.data));
    }
  } catch(e) {
    console.log('Outer Error:', e.message);
  }
}
check();
