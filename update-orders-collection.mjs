import PocketBase from 'pocketbase';

async function updateOrdersCollection() {
  const pb = new PocketBase('http://localhost:8090');
  
  console.log('Authenticating as admin...');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  try {
    const orders = await pb.collections.getOne('orders');
    
    const addField = (collection, fieldDef) => {
      const exists = collection.fields.some(f => f.name === fieldDef.name);
      if (!exists) {
        collection.fields.push(fieldDef);
      } else {
        const idx = collection.fields.findIndex(f => f.name === fieldDef.name);
        collection.fields[idx] = { ...collection.fields[idx], ...fieldDef };
      }
    };
    
    const newFields = [
      { name: 'orderId', type: 'text', required: false },
      { name: 'orderDate', type: 'date', required: false }
    ];
    
    newFields.forEach(f => addField(orders, f));
    
    await pb.collections.update('orders', orders);
    console.log('Successfully added orderId and orderDate to orders collection!');
  } catch (error) {
    console.error('Error updating fields:', error.response ? JSON.stringify(error.response, null, 2) : error.message);
  }
}

updateOrdersCollection();
