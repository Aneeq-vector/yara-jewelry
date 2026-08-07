import os

page_path = 'src/app/yara-admin/cms/shop/page.tsx'
with open(page_path, 'r') as f:
    lines = f.readlines()

def get_lines(start, end):
    return "".join(lines[start-1 : end])

header_block = get_lines(49, 101)
promo_block = get_lines(103, 153)

header_comp = """import { Type, ChevronUp, ChevronDown, ImagePlus } from 'lucide-react';

export function HeaderSection({ expandedSections, toggleSection }: any) {
  return (
    <>
""" + header_block + """
    </>
  );
}
"""

promo_comp = """import { Type, ChevronUp, ChevronDown } from 'lucide-react';

export function PromoSection({ expandedSections, toggleSection }: any) {
  return (
    <>
""" + promo_block + """
    </>
  );
}
"""

os.makedirs('src/app/yara-admin/cms/shop/components', exist_ok=True)
with open('src/app/yara-admin/cms/shop/components/HeaderSection.tsx', 'w') as f: f.write(header_comp)
with open('src/app/yara-admin/cms/shop/components/PromoSection.tsx', 'w') as f: f.write(promo_comp)

# Replace in reverse order so line numbers don't shift!
lines[103-1:153] = ['        <PromoSection expandedSections={expandedSections} toggleSection={toggleSection} />\n']
lines[49-1:101] = ['        <HeaderSection expandedSections={expandedSections} toggleSection={toggleSection} />\n']

import_str = """import { HeaderSection } from './components/HeaderSection';
import { PromoSection } from './components/PromoSection';\n"""
for i, line in enumerate(lines):
    if line.startswith("import {"):
        lines[i] = line + import_str
        break

with open(page_path, 'w') as f:
    f.write("".join(lines))

print("Done extracting components")
