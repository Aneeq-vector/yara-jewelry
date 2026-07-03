'use client';

import PageWrapper from '@/components/layout/PageWrapper';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="font-body text-[#c9856a] tracking-wide uppercase text-sm font-semibold">
              Yara Jewelry
            </p>
            <p className="font-body text-[#4a1c27]/50 text-sm mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-12 font-body text-[#4a1c27]/70 leading-relaxed"
          >
            
            {/* Overview */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-[#4a1c27] mb-4">
                1. Overview
              </h2>
              <p>
                This website is operated by Yara Jewelry. Throughout the site, the terms &quot;we&quot;, &quot;us&quot; and &quot;our&quot; refer to Yara Jewelry. Yara Jewelry offers this website, including all information, tools, and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated here.
              </p>
              <br />
              <p>
                By visiting our site and/or purchasing something from us, you engage in our &quot;Service&quot; and agree to be bound by the following terms and conditions (&quot;Terms of Service&quot;, &quot;Terms&quot;).
              </p>
            </section>

            {/* General Conditions */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-[#4a1c27] mb-4">
                2. General Conditions
              </h2>
              <p>
                We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve transmissions over various networks. Credit card information is always encrypted during transfer over networks.
              </p>
            </section>

            {/* Products or Services */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-[#4a1c27] mb-4">
                3. Products or Services
              </h2>
              <p>
                Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy. We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor&apos;s display of any color will be accurate.
              </p>
            </section>

            {/* Accuracy of Billing */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-[#4a1c27] mb-4">
                4. Accuracy of Billing and Account Information
              </h2>
              <p>
                We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/phone number provided at the time the order was made.
              </p>
            </section>

            {/* Third-Party Links */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-[#4a1c27] mb-4">
                5. Third-Party Links
              </h2>
              <p>
                Certain content, products and services available via our Service may include materials from third-parties. Third-party links on this site may direct you to third-party websites that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy and we do not warrant and will not have any liability or responsibility for any third-party materials or websites.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-[#4a1c27] mb-4">
                6. Changes to Terms of Service
              </h2>
              <p>
                You can review the most current version of the Terms of Service at any time at this page. We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes.
              </p>
            </section>

            <div className="pt-8 border-t border-[#4a1c27]/10">
              <h2 className="font-heading text-2xl font-bold text-[#4a1c27] mb-4">
                Contact Information
              </h2>
              <p>
                Questions about the Terms of Service should be sent to us at <a href="mailto:hello@yarajewelry.com" className="text-[#c9856a] hover:text-[#4a1c27] transition-colors font-medium">hello@yarajewelry.com</a> or via our <Link href="/contact" className="text-[#c9856a] hover:text-[#4a1c27] transition-colors font-medium underline underline-offset-4">contact page</Link>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
