import PocketBase from 'pocketbase';
const pb = new PocketBase('http://localhost:8090');
await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
await pb.collection('categories').delete('9rs31e07x9fv905');
await pb.collection('categories').delete('r956g9ggschhdm2');
await pb.collection('categories').delete('mpilv1q6s4z7r0n');
console.log('Deleted duplicates');
