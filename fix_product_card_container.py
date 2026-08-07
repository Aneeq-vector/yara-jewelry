with open('src/app/shop/components/ProductCard.tsx', 'r') as f:
    c = f.read()

target = "className=\"flex items-center gap-2\""
replacement = "className=\"w-full flex items-center gap-2\""

c = c.replace(target, replacement)

with open('src/app/shop/components/ProductCard.tsx', 'w') as f:
    f.write(c)
