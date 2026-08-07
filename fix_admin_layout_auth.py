with open('src/app/yara-admin/layout.tsx', 'r') as f:
    c = f.read()

old = """  if (pathname === '/yara-admin/login') {
    return <>{children}</>;
  }"""

new = """  if (pathname === '/yara-admin/login') {
    if (isAuthenticated && user?.role === 'admin') {
      redirect('/yara-admin');
    }
    return <>{children}</>;
  }"""

c = c.replace(old, new)

with open('src/app/yara-admin/layout.tsx', 'w') as f:
    f.write(c)
