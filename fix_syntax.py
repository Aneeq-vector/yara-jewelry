import os

# 1. products.ts stray }
with open('src/app/actions/products.ts', 'r') as f:
    c = f.read()
# Find trailing }
c = c.rstrip()
if c.endswith('}'):
    c = c[:-1]
with open('src/app/actions/products.ts', 'w') as f:
    f.write(c)

# 2. signup/page.tsx
with open('src/app/auth/signup/page.tsx', 'r') as f:
    c = f.read()
c = c.replace('0.95.95', '0.95')
with open('src/app/auth/signup/page.tsx', 'w') as f:
    f.write(c)

# 3. Navbar.tsx
with open('src/components/layout/Navbar.tsx', 'r') as f:
    c = f.read()
c = c.replace('0.95.95', '0.95')
with open('src/components/layout/Navbar.tsx', 'w') as f:
    f.write(c)

# 4. gift-boxes/page.tsx: Expected ',' got '{'
with open('src/app/yara-admin/gift-boxes/page.tsx', 'r') as f:
    lines = f.readlines()
# Let's see what is around line 211
for i, line in enumerate(lines):
    if '{/* ── Right: Editor' in line:
        print(f"gift-boxes/page.tsx line {i}: {line}")
        print(f"Before: {lines[i-1]}")
        break

# 5. CustomBoxBuilder.tsx: Unterminated string
with open('src/components/shop/CustomBoxBuilder.tsx', 'r') as f:
    lines = f.readlines()
for i in range(5):
    print(f"CustomBoxBuilder.tsx line {i}: {lines[i]}")

