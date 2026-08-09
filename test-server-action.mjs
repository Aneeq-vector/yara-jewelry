import 'dotenv/config';
import { updateProductDetailsAction } from './.next/server/app/actions/products.js'; // Can't easily import Next.js server actions this way due to webpack

console.log('Skipping because importing Next.js server actions in raw node is hard');
