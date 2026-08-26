import { m as motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';

export function RelatedProducts({ relatedProducts }: { relatedProducts: Product[] }) {
  if (relatedProducts.length === 0) return null;

  return (
    <div className="mt-20">
      <h2 className="font-heading text-3xl font-bold text-burgundy mb-8">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {relatedProducts.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group"
          >
            <Link href={`/shop/${p.id}`}>
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-champagne/30 mb-3">
                <Image src={p.images[0]} alt={p.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectPosition: p.imagePositions?.[0] || '50% 50%' }} className={`object-cover group-hover:scale-105 transition duration-700 ${
                  p.quantity <= 0 ? 'opacity-40 grayscale-[30%]' : ''
                }`} />
                {p.quantity <= 0 && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex items-center justify-center">
                    <span className="px-4 py-2 bg-white/90 text-burgundy font-ui font-bold text-xs uppercase tracking-wider rounded-full shadow-lg whitespace-nowrap">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              <h3 className="font-ui font-semibold text-sm text-burgundy mb-1 line-clamp-1">{p.name}</h3>
              <span className="font-ui font-bold text-sm text-burgundy">{formatPrice(p.price)}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
