with open('src/app/yara-admin/layout.tsx', 'r') as f:
    c = f.read()

# Fix redirect
c = c.replace("redirect('/auth/login');", "if (pathname !== '/yara-admin/login') { redirect('/yara-admin/login'); }")

# Also, if we are on login, don't show the dashboard layout, just return children
c = c.replace("if (!isClient || !hasHydrated) {\n    return null;\n  }", "if (!isClient || !hasHydrated) {\n    return null;\n  }\n\n  if (pathname === '/yara-admin/login') {\n    return <>{children}</>;\n  }")

with open('src/app/yara-admin/layout.tsx', 'w') as f:
    f.write(c)
