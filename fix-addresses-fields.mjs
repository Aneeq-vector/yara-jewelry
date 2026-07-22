import PocketBase from 'pocketbase';

async function fixAddressesFields() {
  const pb = new PocketBase('http://localhost:8090');
  
  console.log('Authenticating as admin...');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  try {
    const addresses = await pb.collections.getOne('addresses');
    const usersCollectionId = (await pb.collections.getOne('users')).id;
    
    const addField = (collection, fieldDef) => {
      const exists = collection.fields.some(f => f.name === fieldDef.name);
      if (!exists) {
        collection.fields.push(fieldDef);
      } else {
        // Update it if it exists
        const idx = collection.fields.findIndex(f => f.name === fieldDef.name);
        collection.fields[idx] = { ...collection.fields[idx], ...fieldDef };
      }
    };
    
    const aFields = [
      { name: 'user', type: 'relation', required: true, options: { collectionId: usersCollectionId, cascadeDelete: true, maxSelect: 1 } },
      { name: 'name', type: 'text', required: true },
      { name: 'street', type: 'text', required: true },
      { name: 'city', type: 'text', required: true },
      { name: 'state', type: 'text', required: false },
      { name: 'zip', type: 'text', required: true },
      { name: 'phone', type: 'text', required: false },
      { name: 'isDefault', type: 'bool', required: false }
    ];
    
    // In PB v0.22/v0.23, relation fields structure is different. 
    // They usually look like { name: 'user', type: 'relation', relationOptions: { collectionId: ... } } OR options: { ... }
    // Actually, setting collectionId directly at the root often works for backward compatibility, but in PocketBase v0.22/0.23, they moved relation config to `relationOptions` or `options` or it's just flattened.
    // Wait, in `setup-collections.mjs` (which I didn't write, it was already there), it's flattened:
    // { name: 'user', type: 'relation', required: true, collectionId: usersCollectionId, cascadeDelete: false, maxSelect: 1 }
    // Let's use the flattened structure exactly like `setup-collections.mjs`.
    
    const aFieldsFlattened = [
      { name: 'user', type: 'relation', required: true, collectionId: usersCollectionId, cascadeDelete: true, maxSelect: 1 },
      { name: 'name', type: 'text', required: true },
      { name: 'street', type: 'text', required: true },
      { name: 'city', type: 'text', required: true },
      { name: 'state', type: 'text', required: false },
      { name: 'zip', type: 'text', required: true },
      { name: 'phone', type: 'text', required: false },
      { name: 'isDefault', type: 'bool', required: false }
    ];
    
    aFieldsFlattened.forEach(f => addField(addresses, f));
    
    await pb.collections.update('addresses', addresses);
    console.log('Successfully updated addresses collection fields!');
  } catch (error) {
    console.error('Error updating fields:', error.response ? JSON.stringify(error.response, null, 2) : error.message);
  }
}

fixAddressesFields();
