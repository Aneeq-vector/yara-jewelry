import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb.yarasl.shop');

async function run() {
  try {
    await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
    const records = await pb.collection('orders').getFullList({
      sort: '-orderDate',
      expand: 'user,items'
    });
    console.log(`Success! Fetched ${records.length} orders.`);
  } catch (err) {
    console.log("Error details:", JSON.stringify(err, null, 2));
  }
}
run();
