import os

with open('src/components/shop/CustomBoxBuilder.tsx', 'r') as f:
    c = f.read()

sidebar_start = c.find('          {/* Right: Box Summary */}')
sidebar_end = c.find('        </div>\n      </div>\n    </div>\n  );\n}')

sidebar = c[sidebar_start:sidebar_end]

sidebar_file = """import React from 'react';
import Image from 'next/image';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Check, MessageCircle } from 'lucide-react';
import { BRAND } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';

export function CustomBoxSidebar({
  baseBox,
  selectedItems,
  flatBoxItems,
  boxItemsTotal,
  totalBoxPrice,
  added,
  handleRemoveItem,
  handleAddItem,
  handleAddToCart,
  buildWhatsAppMessage
}: any) {
  return (
""" + sidebar + """
  );
}
"""

with open('src/components/shop/CustomBoxSidebar.tsx', 'w') as f:
    f.write(sidebar_file)

c = c.replace(sidebar, """          <CustomBoxSidebar
            baseBox={baseBox}
            selectedItems={selectedItems}
            flatBoxItems={flatBoxItems}
            boxItemsTotal={boxItemsTotal}
            totalBoxPrice={totalBoxPrice}
            added={added}
            handleRemoveItem={handleRemoveItem}
            handleAddItem={handleAddItem}
            handleAddToCart={handleAddToCart}
            buildWhatsAppMessage={buildWhatsAppMessage}
          />
""")

c = "import { CustomBoxSidebar } from './CustomBoxSidebar';\n" + c

with open('src/components/shop/CustomBoxBuilder.tsx', 'w') as f:
    f.write(c)
