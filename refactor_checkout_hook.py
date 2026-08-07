import os

page_path = 'src/app/checkout/page.tsx'
with open(page_path, 'r') as f:
    lines = f.readlines()

def get_lines(start_line_1_index, end_line_1_index):
    return "".join(lines[start_line_1_index-1 : end_line_1_index])

# Delete 50 to 306
# We want to replace it with useCheckoutLogic()
hook_call = """  const {
    currentStep, orderPlaced, orderId, receiptFile, uploadState, uploadProgress,
    isSubmitting, savedAddresses, selectedAddressId, errors, items,
    subtotal, form, FREE_DELIVERY_THRESHOLD, shipping, total,
    handleSelectAddress, handleFileChange, retryUpload, updateForm,
    nextStep, prevStep, placeOrder, getInputClass
  } = useCheckoutLogic();

"""

# lines[49:306] replaces lines 50 to 306 inclusive (because index 306 is not included, which means up to 305! Wait, to replace up to line 306, we need index 306, so slice is [49:306])
lines[50-1:306] = [hook_call]

import_str = "import { useCheckoutLogic } from './useCheckoutLogic';\\n"
for i, line in enumerate(lines):
    if line.startswith("import PageWrapper"):
        lines[i] = line + import_str
        break

with open(page_path, 'w') as f:
    f.write("".join(lines))

print("Extraction script done perfectly!")
