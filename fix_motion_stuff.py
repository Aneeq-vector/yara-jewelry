import os

path = 'src/app/yara-admin/gift-boxes/page.tsx'
with open(path, 'r') as f:
    c = f.read()

# Find the first return ( inside GiftBoxesAdminPage
# Wait, it's easier to just use string replace for the specific div
# The root div has className="space-y-6 max-w-7xl"
c = c.replace('<div className="space-y-6 max-w-7xl">', '<LazyMotion features={domAnimation}>\n      <div className="space-y-6 max-w-7xl">', 1)
c = c.replace('</div>\n    </div>\n  );\n}', '</div>\n    </div>\n    </LazyMotion>\n  );\n}', 1)

with open(path, 'w') as f:
    f.write(c)
