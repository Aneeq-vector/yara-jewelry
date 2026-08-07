import os
import re

files = [
    "src/app/auth/signup/page.tsx",
    "src/components/layout/Navbar.tsx"
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace scale: 0 with scale: 0.95 (only inside framer-motion variants/initial)
    # usually it's initial={{ opacity: 0, scale: 0 }}
    new_content = re.sub(r'scale:\s*0\b', 'scale: 0.95', content)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {file}")

