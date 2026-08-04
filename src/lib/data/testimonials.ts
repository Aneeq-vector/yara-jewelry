import { Testimonial } from '@/types';
import { createClient, PB_URL } from '@/lib/pocketbase';
import { RecordModel } from 'pocketbase';

export const testimonials: Testimonial[] = [];

function mapRecordToTestimonial(record: RecordModel): Testimonial {
  const imageUrl = record.image
    ? `${PB_URL}/api/files/${record.collectionId}/${record.id}/${encodeURIComponent(record.image)}`
    : '/placeholder.png';

  return {
    id: record.id,
    name: record.name,
    image: imageUrl,
    rating: record.rating || 5,
    comment: record.comment,
    location: record.location,
  };
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  try {
    const pb = createClient();
    const records = await pb.collection('testimonials').getFullList();
    return records.map(mapRecordToTestimonial);
  } catch (error) {

    return [];
  }
}
