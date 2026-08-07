import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function run() {
  try {
    await pb.admins.authWithPassword('admin@yara.com', 'admin12345');
    const records = await pb.collection('orders').getFullList({
      sort: '-orderDate',
      expand: 'user,items'
    });
    console.log(`Success! Fetched ${records.length} orders.`);
  } catch (err) {
    console.log(JSON.stringify(err, null, 2));
  }
}
run();
