with open('src/app/yara-admin/gift-boxes/page.tsx', 'r') as f:
    c = f.read()
c = c.replace("from '@/app/actions/gift-boxes'", "from '@/app/actions/update-gift-box'")
with open('src/app/yara-admin/gift-boxes/page.tsx', 'w') as f:
    f.write(c)

with open('src/app/auth/signup/page.tsx', 'r') as f:
    c = f.read()
c = c.replace('0.95.9', '0.95')
with open('src/app/auth/signup/page.tsx', 'w') as f:
    f.write(c)
