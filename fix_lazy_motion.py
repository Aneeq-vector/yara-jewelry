import os
import re

files_to_fix = [
    "src/app/auth/signup/page.tsx",
    "src/app/checkout/page.tsx",
    "src/app/yara-admin/gift-boxes/page.tsx",
    "src/components/layout/Navbar.tsx"
]

for file_path in files_to_fix:
    with open(file_path, 'r') as f:
        content = f.read()

    # Replace import
    # This might look like `import { motion } from 'framer-motion';`
    # or `import { motion, AnimatePresence } from 'framer-motion';`
    content = re.sub(r'\bmotion\b\s*,', 'm,', content)
    content = re.sub(r',\s*\bmotion\b', ', m', content)
    content = re.sub(r'{\s*motion\s*}', '{ m }', content)

    # Replace JSX tags
    content = re.sub(r'<motion\.', '<m.', content)
    content = re.sub(r'</motion\.', '</m.', content)

    with open(file_path, 'w') as f:
        f.write(content)
