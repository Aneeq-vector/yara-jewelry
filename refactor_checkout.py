import os

page_path = 'src/app/checkout/page.tsx'
with open(page_path, 'r') as f:
    content = f.read()

# Define the components to extract
# We will just write a new file for each, then replace the block in page.tsx with the component usage.

shipping_block = content[content.find('<motion.div\n                    key="shipping"'):content.find('</motion.div>\n                )\n\n                {/* Step 2: Delivery */}') + 13]
delivery_block = content[content.find('<motion.div\n                    key="delivery"'):content.find('</motion.div>\n                )\n\n                {/* Step 3: Payment */}') + 13]
payment_block = content[content.find('<motion.div\n                    key="payment"'):content.find('</motion.div>\n                )\n\n                {/* Step 4: Review */}') + 13]
review_block = content[content.find('<motion.div\n                    key="review"'):content.find('</motion.div>\n                )\n              </AnimatePresence>')]
success_block = content[content.find('if (orderPlaced) {'):content.find('if (items.length === 0 && !orderPlaced) {')]
summary_block = content[content.find('<div className="glass-card rounded-3xl p-6 sticky top-28">'):content.find('</div>\n            </div>\n          </div>')]

shipping_comp = """import { m as motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Address } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { COUNTRIES } from '@/lib/countries';

export function CheckoutShippingStep({
  form,
  updateForm,
  errors,
  savedAddresses,
  selectedAddressId,
  handleSelectAddress,
  getInputClass
}: any) {
  return (
""" + shipping_block + """
  );
}
"""

delivery_comp = """import { m as motion } from 'framer-motion';

export function CheckoutDeliveryStep({
  form,
  updateForm,
  subtotal,
  FREE_DELIVERY_THRESHOLD
}: any) {
  return (
""" + delivery_block + """
  );
}
"""

payment_comp = """import { m as motion, AnimatePresence } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Info, CreditCard } from 'lucide-react';

export function CheckoutPaymentStep({
  form,
  updateForm
}: any) {
  return (
""" + payment_block + """
  );
}
"""

review_comp = """import { m as motion } from 'framer-motion';
import { Upload, FileTextIcon, Loader2, FileWarningIcon, CheckIcon, XIcon, RefreshCwIcon } from 'lucide-react';
import { Attachment, AttachmentMedia, AttachmentContent, AttachmentTitle, AttachmentDescription, AttachmentActions, AttachmentAction } from '@/components/ui/attachment';

export function CheckoutReviewStep({
  form,
  receiptFile,
  uploadState,
  uploadProgress,
  handleFileChange,
  retryUpload,
  setReceiptFile,
  setUploadState
}: any) {
  return (
""" + review_block + """
  );
}
"""

success_comp = """import { m as motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import PageWrapper from '@/components/layout/PageWrapper';

export function CheckoutSuccess({ orderId }: { orderId: string }) {
  return (
""" + success_block.replace('if (orderPlaced) {\n    return (\n      ', '').replace('\n    );\n  }\n\n  ', '') + """
  );
}
"""

summary_comp = """import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatPrice } from '@/lib/utils';

export function OrderSummary({ items, subtotal, shipping, total }: any) {
  return (
""" + summary_block + """
  );
}
"""

os.makedirs('src/app/checkout/components', exist_ok=True)
with open('src/app/checkout/components/CheckoutShippingStep.tsx', 'w') as f: f.write(shipping_comp)
with open('src/app/checkout/components/CheckoutDeliveryStep.tsx', 'w') as f: f.write(delivery_comp)
with open('src/app/checkout/components/CheckoutPaymentStep.tsx', 'w') as f: f.write(payment_comp)
with open('src/app/checkout/components/CheckoutReviewStep.tsx', 'w') as f: f.write(review_comp)
with open('src/app/checkout/components/CheckoutSuccess.tsx', 'w') as f: f.write(success_comp)
with open('src/app/checkout/components/OrderSummary.tsx', 'w') as f: f.write(summary_comp)

# Now update the page.tsx
content = content.replace(shipping_block, '<CheckoutShippingStep form={form} updateForm={updateForm} errors={errors} savedAddresses={savedAddresses} selectedAddressId={selectedAddressId} handleSelectAddress={handleSelectAddress} getInputClass={getInputClass} />')
content = content.replace(delivery_block, '<CheckoutDeliveryStep form={form} updateForm={updateForm} subtotal={subtotal} FREE_DELIVERY_THRESHOLD={FREE_DELIVERY_THRESHOLD} />')
content = content.replace(payment_block, '<CheckoutPaymentStep form={form} updateForm={updateForm} />')
content = content.replace(review_block, '<CheckoutReviewStep form={form} receiptFile={receiptFile} uploadState={uploadState} uploadProgress={uploadProgress} handleFileChange={handleFileChange} retryUpload={retryUpload} setReceiptFile={setReceiptFile} setUploadState={setUploadState} />')
content = content.replace(success_block, 'if (orderPlaced) return <CheckoutSuccess orderId={orderId} />;\n\n  ')
content = content.replace(summary_block, '<OrderSummary items={items} subtotal={subtotal} shipping={shipping} total={total} />')

imports = """import { CheckoutShippingStep } from './components/CheckoutShippingStep';
import { CheckoutDeliveryStep } from './components/CheckoutDeliveryStep';
import { CheckoutPaymentStep } from './components/CheckoutPaymentStep';
import { CheckoutReviewStep } from './components/CheckoutReviewStep';
import { CheckoutSuccess } from './components/CheckoutSuccess';
import { OrderSummary } from './components/OrderSummary';
"""

content = content.replace("import PageWrapper from '@/components/layout/PageWrapper';", "import PageWrapper from '@/components/layout/PageWrapper';\n" + imports)

with open(page_path, 'w') as f: f.write(content)

print("Checkout component split complete!")
