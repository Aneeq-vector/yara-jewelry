import os
import re

page_path = 'src/app/checkout/page.tsx'
with open(page_path, 'r') as f:
    content = f.read()

shipping_match = re.search(r'<motion\.div\s*key="shipping".*?</motion\.div>', content, re.DOTALL)
delivery_match = re.search(r'<motion\.div\s*key="delivery".*?</motion\.div>', content, re.DOTALL)
payment_match = re.search(r'<motion\.div\s*key="payment".*?</motion\.div>', content, re.DOTALL)
review_match = re.search(r'<motion\.div\s*key="review".*?</motion\.div>', content, re.DOTALL)
summary_match = re.search(r'<div className="glass-card rounded-3xl p-6 sticky top-28">.*?(?=</div>\s*</div>\s*</div>)', content, re.DOTALL)
success_match = re.search(r'if \(orderPlaced\)\s*\{\s*return\s*\(.*?\);\s*\}', content, re.DOTALL)

if not all([shipping_match, delivery_match, payment_match, review_match, summary_match, success_match]):
    print("Match failed!")
    print(shipping_match, delivery_match, payment_match, review_match, summary_match, success_match)
    exit(1)

shipping_block = shipping_match.group(0)
delivery_block = delivery_match.group(0)
payment_block = payment_match.group(0)
review_block = review_match.group(0)
summary_block = summary_match.group(0) + '</div>'
success_block = success_match.group(0)

# Build components exactly as before
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
""" + success_block.replace('if (orderPlaced) {', '').replace('return (', '').rsplit(';', 1)[0].rsplit('}', 1)[0].strip() + """
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

# Replace in page.tsx
content = content.replace(shipping_block, '<CheckoutShippingStep form={form} updateForm={updateForm} errors={errors} savedAddresses={savedAddresses} selectedAddressId={selectedAddressId} handleSelectAddress={handleSelectAddress} getInputClass={getInputClass} />')
content = content.replace(delivery_block, '<CheckoutDeliveryStep form={form} updateForm={updateForm} subtotal={subtotal} FREE_DELIVERY_THRESHOLD={FREE_DELIVERY_THRESHOLD} />')
content = content.replace(payment_block, '<CheckoutPaymentStep form={form} updateForm={updateForm} />')
content = content.replace(review_block, '<CheckoutReviewStep form={form} receiptFile={receiptFile} uploadState={uploadState} uploadProgress={uploadProgress} handleFileChange={handleFileChange} retryUpload={retryUpload} setReceiptFile={setReceiptFile} setUploadState={setUploadState} />')
content = content.replace(summary_block, '<OrderSummary items={items} subtotal={subtotal} shipping={shipping} total={total} />')
content = content.replace(success_block, 'if (orderPlaced) return <CheckoutSuccess orderId={orderId} />;')

imports = """import { CheckoutShippingStep } from './components/CheckoutShippingStep';
import { CheckoutDeliveryStep } from './components/CheckoutDeliveryStep';
import { CheckoutPaymentStep } from './components/CheckoutPaymentStep';
import { CheckoutReviewStep } from './components/CheckoutReviewStep';
import { CheckoutSuccess } from './components/CheckoutSuccess';
import { OrderSummary } from './components/OrderSummary';
"""

content = content.replace("import PageWrapper from '@/components/layout/PageWrapper';", "import PageWrapper from '@/components/layout/PageWrapper';\\n" + imports)

with open(page_path, 'w') as f: f.write(content)

print("Done with Regex extractor!")
