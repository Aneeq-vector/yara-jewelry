import PocketBase from 'pocketbase';

async function testAddAddress() {
  const pb = new PocketBase('http://localhost:8090');
  
  await pb.admins.authWithPassword('ahmedaneeq.official@gmail.com', 'aneeq2002');
  
  try {
    const user = await pb.collection('users').getFirstListItem('email="laifa@gmail.com"');
    console.log("Found user:", user.id);
    
    // Simulate frontend payload
    const payload = {
      user: user.id,
      name: "Home",
      street: "123 Main St",
      city: "Colombo",
      state: "WP",
      zip: "00100",
      country: "Sri Lanka",
      phone: "0771234567",
      isDefault: false
    };
    
    await pb.collection('addresses').create(payload);
    console.log("Successfully created address!");
  } catch (error) {
    console.error('Error creating address:', error.response ? JSON.stringify(error.response, null, 2) : error.message);
  }
}

testAddAddress();
