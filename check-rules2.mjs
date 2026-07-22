import PocketBase from 'pocketbase';
async function main() {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  const products = await pb.collections.getOne('products');
  console.log('Is null?', products.listRule === null);
  console.log('Is empty string?', products.listRule === "");
}
main().catch(console.error);
