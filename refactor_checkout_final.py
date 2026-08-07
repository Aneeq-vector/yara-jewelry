import os

page_path = 'src/app/checkout/page.tsx'
with open(page_path, 'r') as f:
    lines = f.readlines()

def get_lines(start, end):
    return "".join(lines[start:end])

# EXACT INDICES (0-indexed lines)
shipping_block = get_lines(377, 461)
delivery_block = get_lines(465, 506)
payment_block = get_lines(510, 590)
review_block = get_lines(594, 670)

# Success Block: Inside the if(orderPlaced) return ( ... );
success_block = get_lines(284, 305) # from <PageWrapper> to </PageWrapper>

# Summary Block
summary_block = get_lines(707, 757) # from <div className="glass-card..."> to </div>

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
  getInputClass,
  currentStep
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
  FREE_DELIVERY_THRESHOLD,
  currentStep
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
  updateForm,
  currentStep
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
  setUploadState,
  currentStep
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
""" + success_block + """
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

# Replacing in the file using lines exactly
lines[707:757] = ['              <OrderSummary items={items} subtotal={subtotal} shipping={shipping} total={total} />\\n']
lines[594:670] = ['                  <CheckoutReviewStep form={form} receiptFile={receiptFile} uploadState={uploadState} uploadProgress={uploadProgress} handleFileChange={handleFileChange} retryUpload={retryUpload} setReceiptFile={setReceiptFile} setUploadState={setUploadState} currentStep={currentStep} />\\n']
lines[510:590] = ['                  <CheckoutPaymentStep form={form} updateForm={updateForm} currentStep={currentStep} />\\n']
lines[465:506] = ['                  <CheckoutDeliveryStep form={form} updateForm={updateForm} subtotal={subtotal} FREE_DELIVERY_THRESHOLD={FREE_DELIVERY_THRESHOLD} currentStep={currentStep} />\\n']
lines[377:461] = ['                  <CheckoutShippingStep form={form} updateForm={updateForm} errors={errors} savedAddresses={savedAddresses} selectedAddressId={selectedAddressId} handleSelectAddress={handleSelectAddress} getInputClass={getInputClass} currentStep={currentStep} />\\n']

# For success, we replace 284 to 305
lines[284:305] = ['      <CheckoutSuccess orderId={orderId} />\\n']

# now add imports at top
import_str = """import { CheckoutShippingStep } from './components/CheckoutShippingStep';
import { CheckoutDeliveryStep } from './components/CheckoutDeliveryStep';
import { CheckoutPaymentStep } from './components/CheckoutPaymentStep';
import { CheckoutReviewStep } from './components/CheckoutReviewStep';
import { CheckoutSuccess } from './components/CheckoutSuccess';
import { OrderSummary } from './components/OrderSummary';
"""
for i, line in enumerate(lines):
    if line.startswith("import PageWrapper"):
        lines[i] = line + import_str
        break

with open(page_path, 'w') as f:
    f.write("".join(lines))

print("Done with final script!")
