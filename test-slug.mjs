import PocketBase from 'pocketbase';
const pb = new PocketBase('http://localhost:8090');
const records = await pb.collection('categories').getFullList();
records.forEach(r => console.log(r.name, '=>', r.slug));
