with open('src/middleware.ts', 'r') as f:
    c = f.read()

target = """  // Protect /yara-admin and all subpaths
  if (path.startsWith('/yara-admin')) {"""

replacement = """  // Protect /yara-admin and all subpaths
  if (path.startsWith('/yara-admin')) {
    // Allow access to the admin login page
    if (path === '/yara-admin/login') {
      return NextResponse.next();
    }"""

c = c.replace(target, replacement)

with open('src/middleware.ts', 'w') as f:
    f.write(c)

