with open('src/app/shop/components/ProductCard.tsx', 'r') as f:
    c = f.read()

target1 = "className=\"flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px]"
replacement1 = "className=\"flex-1 w-full flex items-center justify-center gap-2 py-2.5 px-4 min-h-[44px]"

c = c.replace(target1, replacement1)

with open('src/app/shop/components/ProductCard.tsx', 'w') as f:
    f.write(c)
