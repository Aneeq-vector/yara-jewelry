require('dotenv').config();
const { getProductsAction } = require('./src/app/actions/products.js') || {};
// Just test the server action manually
async function test() {
  try {
    const fetch = global.fetch; // just to test
  } catch(e) {}
}
