import { getProductBySlug } from './src/lib/data/products.js';
(async () => {
  const p = await getProductBySlug('diamond-solitaire-ring');
  console.log(p?.images);
})();
