import os

page_path = 'src/app/yara-admin/cms/home/page.tsx'
with open(page_path, 'r') as f:
    lines = f.readlines()

def get_lines(start, end):
    return "".join(lines[start-1 : end])

announcement_block = get_lines(59, 121)
hero_block = get_lines(123, 227)

announcement_comp = """import { Type, ChevronUp, ChevronDown, Link as LinkIcon } from 'lucide-react';

export function AnnouncementSection({ expandedSections, toggleSection }: any) {
  return (
    <>
""" + announcement_block + """
    </>
  );
}
"""

hero_comp = """import { Layout, ChevronUp, ChevronDown, ImagePlus, Upload } from 'lucide-react';

export function HeroSection({ expandedSections, toggleSection }: any) {
  return (
    <>
""" + hero_block + """
    </>
  );
}
"""

os.makedirs('src/app/yara-admin/cms/home/components', exist_ok=True)
with open('src/app/yara-admin/cms/home/components/AnnouncementSection.tsx', 'w') as f: f.write(announcement_comp)
with open('src/app/yara-admin/cms/home/components/HeroSection.tsx', 'w') as f: f.write(hero_comp)

# Replace in reverse order so line numbers don't shift!
lines[123-1:227] = ['        <HeroSection expandedSections={expandedSections} toggleSection={toggleSection} />\n']
lines[59-1:121] = ['        <AnnouncementSection expandedSections={expandedSections} toggleSection={toggleSection} />\n']

import_str = """import { AnnouncementSection } from './components/AnnouncementSection';
import { HeroSection } from './components/HeroSection';\n"""
for i, line in enumerate(lines):
    if line.startswith("import {"):
        lines[i] = line + import_str
        break

with open(page_path, 'w') as f:
    f.write("".join(lines))

print("Done extracting components")
