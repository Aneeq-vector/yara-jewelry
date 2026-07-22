/**
 * Setup script: Creates the `gift_boxes` collection in PocketBase and seeds 3 records.
 * 
 * Usage:
 *   node setup-gift-boxes.mjs
 * 
 * Prerequisites:
 *   - PocketBase running at http://localhost:8090
 *   - POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD set in .env
 */

import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';

// Load env
let PB_URL = 'http://localhost:8090';
let ADMIN_EMAIL = '';
let ADMIN_PASSWORD = '';

try {
  const env = readFileSync('.env', 'utf8');
  env.split('\n').forEach((line) => {
    const [key, ...vals] = line.split('=');
    const val = vals.join('=').trim().replace(/^"|"$/g, '');
    if (key === 'NEXT_PUBLIC_POCKETBASE_URL') PB_URL = val;
    if (key === 'POCKETBASE_ADMIN_EMAIL') ADMIN_EMAIL = val;
    if (key === 'POCKETBASE_ADMIN_PASSWORD') ADMIN_PASSWORD = val;
  });
} catch (e) {
  console.warn('Could not read .env file, using defaults');
}

const pb = new PocketBase(PB_URL);

async function main() {
  console.log(`Connecting to PocketBase at ${PB_URL}...`);
  await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('✅ Authenticated as admin');

  // ── 1. Create gift_boxes collection ──────────────────────────────────────
  const collections = await pb.collections.getFullList();
  const existing = collections.find((c) => c.name === 'gift_boxes');

  if (existing) {
    console.log('ℹ️  gift_boxes collection already exists, skipping creation.');
  } else {
    console.log('Creating gift_boxes collection...');
    await pb.collections.create({
      name: 'gift_boxes',
      type: 'base',
      listRule: '',
      viewRule: '',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['birthday', 'anniversary', 'custom'],
        },
        { name: 'description', type: 'text' },
        { name: 'short_description', type: 'text' },
        { name: 'box_price', type: 'number', required: true, min: 0 },
        { name: 'images', type: 'file', maxSelect: 10, maxSize: 5242880 },
        {
          name: 'category',
          type: 'relation',
          collectionId: collections.find((c) => c.name === 'categories')?.id || '',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'fixed_items',
          type: 'relation',
          collectionId: collections.find((c) => c.name === 'products')?.id || '',
          cascadeDelete: false,
          maxSelect: 20,
        },
        { name: 'is_active', type: 'bool' },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_gift_boxes_slug ON gift_boxes (slug)'],
    });
    console.log('✅ gift_boxes collection created');
  }

  // ── 2. Seed 3 gift box records ────────────────────────────────────────────
  const boxCollection = await pb.collection('gift_boxes').getFullList().catch(() => []);
  const existingSlugs = boxCollection.map((r) => r.slug);

  const seeds = [
    {
      name: 'Birthday Gift Box',
      slug: 'birthday-gift-box',
      type: 'birthday',
      description:
        "A beautifully curated collection of our finest pieces, perfectly assembled to make someone's birthday unforgettable. Wrapped with love and elegance.",
      short_description: 'Curated birthday jewelry set',
      box_price: 500,
      is_active: true,
    },
    {
      name: 'Anniversary Gift Box',
      slug: 'anniversary-gift-box',
      type: 'anniversary',
      description:
        'Celebrate love and milestones with our handpicked anniversary jewelry set — timeless pieces that speak the language of devotion and beauty.',
      short_description: 'Curated anniversary jewelry set',
      box_price: 700,
      is_active: true,
    },
    {
      name: 'Customize Gift Box',
      slug: 'customize-gift-box',
      type: 'custom',
      description:
        "Design your own perfect gift box. Choose any pieces from our collection and we'll package them beautifully for you. Chat with us on WhatsApp for even more personalization!",
      short_description: 'Build your own gift set',
      box_price: 400,
      is_active: true,
    },
  ];

  for (const seed of seeds) {
    if (existingSlugs.includes(seed.slug)) {
      console.log(`ℹ️  "${seed.name}" already exists, skipping.`);
      continue;
    }
    await pb.collection('gift_boxes').create(seed);
    console.log(`✅ Created: "${seed.name}"`);
  }

  // ── 3. Instructions for linking fixed_items ───────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎁 Gift Boxes setup complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('NEXT STEPS:');
  console.log('1. Open PocketBase Admin UI: http://localhost:8090/_/');
  console.log('2. Go to gift_boxes collection');
  console.log('3. Edit "Birthday Gift Box" and "Anniversary Gift Box"');
  console.log('4. In the "fixed_items" field, select which products go in each box');
  console.log('5. Upload images for each box in the "images" field');
  console.log('6. The "Customize Gift Box" does NOT need fixed_items (customers pick)');
  console.log('');
  console.log('Your Gift Boxes category is live at: http://localhost:3000/gift-boxes');
}

main().catch((err) => {
  console.error('❌ Error:', err.message || err);
  process.exit(1);
});
