with open('src/lib/pocketbase-server.ts', 'r') as f:
    c = f.read()

target = "pb.authStore.loadFromCookie(`pb_admin_auth=${pbAuthCookie.value}`);"
replacement = "pb.authStore.loadFromCookie(`pb_admin_auth=${pbAuthCookie.value}`, 'pb_admin_auth');"

c = c.replace(target, replacement)

with open('src/lib/pocketbase-server.ts', 'w') as f:
    f.write(c)

