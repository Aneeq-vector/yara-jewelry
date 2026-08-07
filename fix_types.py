with open('src/app/yara-admin/gift-boxes/page.tsx', 'r') as f:
    c = f.read()

c = c.replace('categories.map((cat)', 'categories.map((cat: any)')
c = c.replace('filteredProducts.map((p)', 'filteredProducts.map((p: any)')
c = c.replace('boxes.map((box)', 'boxes.map((box: any)')

with open('src/app/yara-admin/gift-boxes/page.tsx', 'w') as f:
    f.write(c)

