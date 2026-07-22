import PocketBase from 'pocketbase';
const pb = new PocketBase('http://localhost:8090');
const records = await pb.collection('products').getList(1, 1);
const record = records.items[0];
const PB_URL = 'http://localhost:8090';
const images = (record.images || []).map(
    (filename) => filename.startsWith('http') ? filename : `${PB_URL}/api/files/${record.collectionId}/${record.id}/${filename}`
);
console.log(images);
