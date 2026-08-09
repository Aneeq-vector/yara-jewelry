import 'dotenv/config';
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb.yarasl.shop');

async function checkLogs() {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
  
  await pb.admins.authWithPassword(adminEmail, adminPassword);

  const logs = await pb.send('/api/logs', {
    method: 'GET',
    query: {
      page: 1,
      perPage: 30,
      sort: '-created'
    }
  });

  console.log("Recent logs:");
  logs.items.forEach(log => {
    const logStr = JSON.stringify(log);
    if (logStr.includes('products')) {
      console.log(logStr);
    }
  });
}

checkLogs();
