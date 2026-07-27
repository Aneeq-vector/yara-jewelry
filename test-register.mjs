import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb.yarasl.shop');

async function run() {
  try {
    const record = await pb.collection('users').create({
      email: 'test_validation_agent@example.com',
      password: 'Password123!',
      passwordConfirm: 'Password123!',
      name: 'Test Agent',
      phone: '1234567890',
      role: 'customer'
    });
    console.log('Success:', record.id);
  } catch (err) {
    console.error('Error message:', err.message);
    if (err.data) {
      console.error('Error data:', JSON.stringify(err.data, null, 2));
    }
    if (err.response) {
      console.error('Error response:', JSON.stringify(err.response, null, 2));
    }
  }
}

run();
