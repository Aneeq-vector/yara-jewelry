import { getAllCategories } from './src/lib/data/categories.js';

async function test() {
  console.log('Testing getAllCategories...');
  const cats = await getAllCategories();
  console.log(cats);
}

test();
