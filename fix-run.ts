import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
const pbServer = require('./src/lib/pocketbase-server');
// mock it properly
pbServer.validateSession = async () => {
    return { user: { id: 'admin' } };
};

const orders = require('./src/app/actions/orders');

async function test() {
  const payload = {
    shippingName: 'Test',
    shippingPhone: '123',
    shippingStreet: '123 Street',
    shippingCity: 'Colombo',
    shippingZip: '12345',
    shippingCountry: 'Sri Lanka',
    source: 'manual',
    items: [
      {
        productId: 'gfr2dkjd0d6np9s', // Test product
        productName: 'Test',
        price: 100,
        colorQuantities: { Gold: 3, Silver: 7 }
      }
    ],
    totalAmount: 1000,
    paymentMethod: 'cod' as const,
    paymentStatus: 'pending' as const,
    deductStock: true
  };
  
  const res = await orders.createManualOrderAction(payload);
  console.log("RESULT:", JSON.stringify(res, null, 2));
}

test().catch(console.error);
