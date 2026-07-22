const fs = require('fs');
let content = fs.readFileSync('src/app/actions/products.ts', 'utf8');

const newAction = `
export async function updateProductWithFilesAction(id: string, formData: FormData) {
  try {
    const pb = await getAdminClient();
    
    // Convert FormData to standard PocketBase payload
    // PocketBase's SDK natively handles FormData instances for file uploads!
    const record = await pb.collection('products').update(id, formData);
    
    return { success: true, product: JSON.parse(JSON.stringify(record)) };
  } catch (error: any) {
    return { error: error.message || 'Failed to update product' };
  }
}
`;

content += newAction;

fs.writeFileSync('src/app/actions/products.ts', content);
console.log('Added updateProductWithFilesAction');
