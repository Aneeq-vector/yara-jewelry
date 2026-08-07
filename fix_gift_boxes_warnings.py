with open('src/app/yara-admin/gift-boxes/page.tsx', 'r') as f:
    c = f.read()

c = c.replace('}, [selectedBoxId]);', '}, [selectedBox]);')
c = c.replace('<select\n                    value={editorCategory}', '<select\n                    aria-label="Category Filter"\n                    value={editorCategory}')
c = c.replace('<input\n                    type="text"\n                    value={productSearch}', '<input\n                    aria-label="Search Products"\n                    type="text"\n                    value={productSearch}')
c = c.replace('<AnimatePresence mode="wait">', '<div>')
c = c.replace('</AnimatePresence>', '</div>')

with open('src/app/yara-admin/gift-boxes/page.tsx', 'w') as f:
    f.write(c)
