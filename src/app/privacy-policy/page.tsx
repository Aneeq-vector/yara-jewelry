'use client';

import PageWrapper from '@/components/layout/PageWrapper';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  return (
    <PageWrapper>
      <div className="pt-32 pb-24 bg-[#fdf9f6] min-h-screen">
        <div className="max-w-3xl mx-auto px-6 sm:px-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#4a1c27] mb-4">
              Exchange & Returns Policy
            </h1>
            <p className="font-body text-[#c9856a] tracking-wide uppercase text-sm font-semibold">
              Yara Jewelry
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-12 font-body text-[#4a1c27]/70 leading-relaxed"
          >
            
            {/* Introduction */}
            <section>
              <p>
                At Yara, your satisfaction is our priority. We offer a 7-Day Hassle-Free Exchange to ensure a smooth shopping experience.
              </p>
            </section>

            {/* 7-Day Hassle-Free Exchange */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-[#4a1c27] mb-4">
                7-Day Hassle-Free Exchange
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Exchange requests must be made within 7 days of delivery.</li>
                <li>We do not offer refunds, but we&apos;re always happy to assist with an exchange.</li>
              </ul>
            </section>

            {/* How to Request an Exchange */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-[#4a1c27] mb-4">
                How to Request an Exchange
              </h2>
              <p className="mb-4">To initiate an exchange via courier, please:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Email us within 7 days of receiving the item at <strong>hello@yarajewelry.com</strong>.</li>
                <li>Include your order number and reason for exchange in the email.</li>
              </ul>
            </section>

            {/* Courier & Product Condition */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-[#4a1c27] mb-4">
                Courier & Product Condition
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>If the exchange is due to a manufacturing defect, damage, or an incorrect item being sent, Yara will cover the return shipping cost.</li>
                <li>For all other exchange reasons (e.g., size, design preference, or change of mind), the customer is responsible for return shipping costs.</li>
                <li>Items must be returned in unused, unworn condition with their original packaging intact.</li>
              </ul>
            </section>

            {/* Damaged, Missing, or Incorrect Items */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-[#4a1c27] mb-4">
                Damaged, Missing, or Incorrect Items
              </h2>
              <p>
                If you receive a damaged item, missing product, or incorrect order, please contact <strong>hello@yarajewelry.com</strong> within 7 days, and we will resolve the issue promptly at no extra cost to you.
              </p>
            </section>

          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
