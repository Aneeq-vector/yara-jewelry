import PocketBase from 'pocketbase';

async function testUserAddAddress() {
  const pb = new PocketBase('http://localhost:8090');
  
  // Login as normal user
  const authData = await pb.collection('users').authWithPassword('customer@yara.com', 'password123');
  
  try {
    const payload = {
      user: authData.record.id,
      name: "Work",
      street: "456 Office Rd",
      city: "Colombo",
      state: "WP",
      zip: "00100",
      phone: "0771234567",
      isDefault: false
    };
    
    await pb.collection('addresses').create(payload);
    console.log("Successfully created address as user!");
  } catch (error) {
    console.error('Error creating address as user:', error.response ? JSON.stringify(error.response, null, 2) : error.message);
  }
}

testUserAddAddress();
