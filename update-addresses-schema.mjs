import PocketBase from 'pocketbase';

async function setupAddresses() {
  const pb = new PocketBase('http://localhost:8090');
  
  console.log('Authenticating as admin...');
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  try {
    const usersCollectionId = (await pb.collections.getOne('users')).id;
    
    console.log('Configuring addresses collection...');
    
    // Check if addresses collection exists
    let addressesCollection;
    try {
      addressesCollection = await pb.collections.getOne('addresses');
      console.log('Addresses collection already exists.');
    } catch (e) {
      console.log('Creating addresses collection...');
      
      const newCollection = {
        name: 'addresses',
        type: 'base',
        system: false,
        schema: [
          { name: 'user', type: 'relation', required: true, presentable: false, unique: false, collectionId: usersCollectionId, cascadeDelete: true, minSelect: null, maxSelect: 1, displayFields: null },
          { name: 'name', type: 'text', required: true, presentable: false, unique: false },
          { name: 'street', type: 'text', required: true, presentable: false, unique: false },
          { name: 'city', type: 'text', required: true, presentable: false, unique: false },
          { name: 'state', type: 'text', required: false, presentable: false, unique: false },
          { name: 'zip', type: 'text', required: true, presentable: false, unique: false },
          { name: 'phone', type: 'text', required: false, presentable: false, unique: false },
          { name: 'isDefault', type: 'bool', required: false, presentable: false, unique: false },
        ],
        indexes: [],
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != ""',
        deleteRule: '@request.auth.id != ""',
      };
      
      await pb.collections.create(newCollection);
      console.log('Successfully created addresses collection!');
    }
    
  } catch (error) {
    console.error('Error updating schema:', error.response ? JSON.stringify(error.response, null, 2) : error.message);
  }
}

setupAddresses();
