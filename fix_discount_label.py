with open('src/app/shop/components/ProductCard.tsx', 'r') as f:
    c = f.read()

target = """        {(product.originalPrice || 0) > 0 && (
          <div className="absolute bottom-3 left-3 z-10">"""

replacement = """        {(product.originalPrice || 0) > 0 && (
          <div className="absolute bottom-3 left-3 z-10 transition-opacity duration-300 lg:group-hover:opacity-0">"""

c = c.replace(target, replacement)

with open('src/app/shop/components/ProductCard.tsx', 'w') as f:
    f.write(c)
