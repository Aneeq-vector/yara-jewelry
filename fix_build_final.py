with open('src/components/shop/CustomBoxBuilder.tsx', 'r') as f:
    c = f.read()
# move use client to top
if "const emptyArray: any[] = [];\n'use client';" in c:
    c = c.replace("const emptyArray: any[] = [];\n'use client';", "'use client';\nconst emptyArray: any[] = [];")
with open('src/components/shop/CustomBoxBuilder.tsx', 'w') as f:
    f.write(c)

with open('src/components/shop/CustomBoxSidebar.tsx', 'r') as f:
    c = f.read()
c = c.replace('<AnimatePresence mode="wait">', '<div>')
with open('src/components/shop/CustomBoxSidebar.tsx', 'w') as f:
    f.write(c)
