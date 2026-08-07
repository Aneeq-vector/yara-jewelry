import re

# 1. gift-boxes/page.tsx missing sizes
with open('src/app/yara-admin/gift-boxes/page.tsx', 'r') as f:
    c = f.read()

# find `<Image\n  src={...}\n  alt={...}\n  fill\n  className="object-cover"\n  unoptimized\n/>`
c = re.sub(r'(<Image[^>]+)fill(\s+className="object-cover")', r'\1fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"\2', c)
with open('src/app/yara-admin/gift-boxes/page.tsx', 'w') as f:
    f.write(c)

# 2. CustomBoxBuilder.tsx
with open('src/components/shop/CustomBoxBuilder.tsx', 'r') as f:
    c = f.read()
c = re.sub(r'(<Image[^>]+)fill(\s+className="object-cover")', r'\1fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"\2', c)
# rerender-memo-with-default-value
c = re.sub(r'initialSelectedItems = \[\],', 'initialSelectedItems = emptyArray,', c)
c = re.sub(r'categories = \[\],', 'categories = emptyArray,', c)
# add `const emptyArray = [];` if not exists
if 'const emptyArray' not in c:
    c = 'const emptyArray: any[] = [];\n' + c

# chained array iterations
c = re.sub(r'\.filter\(\(p\) => p\.is_active\)\s*\.map\(\(p\) => \(\{', r'.reduce((acc: any[], p: any) => { if (p.is_active) acc.push({', c)
c = re.sub(r'category: p\.category,\s*\}\)\)', r'category: p.category, }); return acc; }, [])', c)

# control-has-associated-label
c = re.sub(r'<button([^>]*onClick=\{\(\) => toggleColor)', r'<button aria-label="Toggle color"\1', c)

with open('src/components/shop/CustomBoxBuilder.tsx', 'w') as f:
    f.write(c)
