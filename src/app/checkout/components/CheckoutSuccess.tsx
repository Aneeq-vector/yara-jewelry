import { m as motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import PageWrapper from '@/components/layout/PageWrapper';

export function CheckoutSuccess({ orderId }: { orderId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  const handleViewOrders = () => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.user(user.id) });
    }
    sessionStorage.setItem('CHECKOUT_NAV_START_MS', performance.now().toString());
    router.replace('/dashboard/orders');
  };

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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/shop" className="btn-secondary inline-flex items-center justify-center px-6 py-3 rounded-xl min-w-[200px]">
              <span>Continue Shopping</span>
            </Link>
            <button 
              onClick={handleViewOrders} 
              className="btn-primary inline-flex items-center justify-center px-6 py-3 rounded-xl min-w-[200px]"
            >
              <span>View My Orders</span>
            </button>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
