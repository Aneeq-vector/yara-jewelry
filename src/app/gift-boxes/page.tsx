import { getAllGiftBoxes } from '@/lib/data/gift-boxes';
import GiftBoxesClient from './_GiftBoxesClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gift Boxes | Yara Jewelry',
  description: 'Curated gift boxes for every occasion.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function GiftBoxesPage() {
  const initialBoxes = await getAllGiftBoxes();
  return <GiftBoxesClient initialBoxes={initialBoxes} />;
}
