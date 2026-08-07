import os

# 1. CustomBoxSidebar.tsx
with open('src/components/shop/CustomBoxSidebar.tsx', 'r') as f:
    c = f.read()
# Let's wrap the return content with <> and </> if not already. But wait, it starts with `<div className="lg:col-span-1">`
# Let's see what is on line 20-22
# It says:
#   return (
#           {/* Right: Box Summary */}
#           <div className="lg:col-span-1">
# This is a syntax error because JSX comments must be inside a parent element or it expects a single expression.
# The comment is `{/* ... */}` but it's the first thing in the return! It needs a Fragment.
c = c.replace('  return (\n          {/* Right: Box Summary */}', '  return (\n          <>\n          {/* Right: Box Summary */}')
c = c.replace('  );\n}', '  </>\n  );\n}')
with open('src/components/shop/CustomBoxSidebar.tsx', 'w') as f:
    f.write(c)

# 2. gift-boxes/page.tsx
with open('src/app/yara-admin/gift-boxes/page.tsx', 'r') as f:
    c = f.read()
# Same thing:
#         {/* ── Right: Editor ──────────────────────────────────────────── */}
#         <GiftBoxEditor 
# But wait, this is inside a div? Let's check `gift-boxes/page.tsx` later if this fails.
c = c.replace('{/* ── Right: Editor', '{/* ── Right ── */}\n{/* ── Right: Editor')
# Actually, the error was Expected ',', got '{' on line 211.
# This happens if it is inside an array or something? No, if it's `{/* comment */}` directly in `return` without parent.
# Let's just strip the comment.
c = c.replace('{/* ── Right: Editor ──────────────────────────────────────────── */}', '')
with open('src/app/yara-admin/gift-boxes/page.tsx', 'w') as f:
    f.write(c)

# 3. signup/page.tsx
with open('src/app/auth/signup/page.tsx', 'r') as f:
    c = f.read()
c = c.replace('0.95.98', '0.98')
with open('src/app/auth/signup/page.tsx', 'w') as f:
    f.write(c)

# 4. CustomBoxBuilder.tsx
with open('src/components/shop/CustomBoxBuilder.tsx', 'r') as f:
    lines = f.readlines()
# Move 'use client'; to line 0
new_lines = ["'use client';\n"]
for line in lines:
    if line.strip() != "'use client';":
        new_lines.append(line)
with open('src/components/shop/CustomBoxBuilder.tsx', 'w') as f:
    f.writelines(new_lines)

# 5. constants.ts
with open('src/lib/constants.ts', 'r') as f:
    c = f.read()
c = c.replace('const NAV_LINKS', 'export const NAV_LINKS')
with open('src/lib/constants.ts', 'w') as f:
    f.write(c)

