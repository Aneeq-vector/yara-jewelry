import PocketBase from 'pocketbase';

async function updateOrdersSchema() {
  const pb = new PocketBase('http://localhost:8090');
  
  console.log('Authenticating as admin...');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  try {
    const orders = await pb.collections.getOne('orders');
    
    // Find and remove the shippingAddress field
    const addrFieldIndex = orders.fields.findIndex(f => f.name === 'shippingAddress');
    if (addrFieldIndex !== -1) {
      orders.fields.splice(addrFieldIndex, 1);
    }
    
    // Add new individual shipping fields if they don't exist
    const fieldsToAdd = [
      { name: 'shippingName', type: 'text', required: true, presentable: false, unique: false },
      { name: 'shippingStreet', type: 'text', required: true, presentable: false, unique: false },
      { name: 'shippingCity', type: 'text', required: true, presentable: false, unique: false },
      { name: 'shippingZip', type: 'text', required: true, presentable: false, unique: false },
      { name: 'shippingCountry', type: 'text', required: true, presentable: false, unique: false }
    ];

    for (const f of fieldsToAdd) {
      if (!orders.fields.some(existing => existing.name === f.name)) {
        orders.fields.push(f);
      }
    }
    
    await pb.collections.update('orders', orders);
    console.log('Successfully updated orders collection schema. Added separate shipping fields.');
  } catch (error) {
    console.error('Error updating schema:', error.response ? JSON.stringify(error.response, null, 2) : error.message);
  }
}

updateOrdersSchema();
