import { m as motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import PageWrapper from '@/components/layout/PageWrapper';

export function CheckoutSuccess({ orderId }: { orderId: string }) {
  return (
    <PageWrapper>
      <div className="pt-32 pb-20 text-center max-w-lg mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <div className="w-24 h-24 rounded-full gradient-rose-gold flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-white" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-burgundy mb-3">Order Placed!</h1>
          <p className="font-body text-burgundy/50 mb-2">Thank you for shopping with Yara.</p>
          <p className="font-body text-sm text-burgundy/40 mb-8">
            Order #{orderId} — A confirmation email has been sent.
          </p>
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
            <span>Continue Shopping</span>
          </Link>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
