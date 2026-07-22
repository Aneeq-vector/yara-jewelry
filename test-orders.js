const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('http://127.0.0.1:8090');
pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002').then(() => {
  return pb.collection('orders').getFullList({ sort: '-orderDate', expand: 'user' });
}).then(res => {
  if (res.length > 0) {
    console.log("cartDetails type:", typeof res[0].cartDetails);
    console.log("cartDetails Array.isArray:", Array.isArray(res[0].cartDetails));
    console.log("cartDetails value:", res[0].cartDetails);
    
    // Also items
    console.log("items type:", typeof res[0].items);
    console.log("items Array.isArray:", Array.isArray(res[0].items));
    console.log("items value:", res[0].items);
  }
}).catch(err => {
  console.error("ERROR:", err.message, err.data);
});
