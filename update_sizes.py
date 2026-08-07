import re
import glob

files = [
    "src/app/about/page.tsx",
    "src/app/checkout/page.tsx",
    "src/app/shop/[id]/page.tsx",
    "src/app/shop/page.tsx",
    "src/app/wishlist/page.tsx",
    "src/app/yara-admin/gift-boxes/page.tsx",
    "src/components/gift-boxes/FixedBoxViewer.tsx",
    "src/components/gift-boxes/GiftBoxCard.tsx",
    "src/components/home/InstagramShowcase.tsx",
    "src/components/home/Testimonials.tsx",
    "src/components/home/TrendingProducts.tsx"
]

sizes_attr = 'sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"'

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # The regex looks for `<Image` followed by properties and `fill`.
    # We replace `fill` with `fill sizes="..."` if `sizes=` is not already there.
    # Note: <Image ... fill ... />
    
    # We will use a regex to match `<Image[^>]*fill[^>]*>` and add sizes if missing
    def repl(m):
        tag = m.group(0)
        if 'sizes=' in tag:
            return tag
        # Insert sizes after fill
        # It could be `fill ` or `fill>` or `fill={true}` 
        new_tag = re.sub(r'\bfill\b', f'fill {sizes_attr}', tag)
        return new_tag

    new_content = re.sub(r'<Image[^>]*\bfill\b[^>]*>', repl, content)
    
    with open(file, 'w') as f:
        f.write(new_content)

print("Updated sizes")
