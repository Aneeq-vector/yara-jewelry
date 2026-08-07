with open('src/app/actions/auth.ts', 'r') as f:
    c = f.read()
c = c.replace('async function registerAction', 'export async function registerAction')
c = c.replace('async function getUserAction', 'export async function getUserAction')
c = c.replace('async function getAdminUsersAction', 'export async function getAdminUsersAction')
with open('src/app/actions/auth.ts', 'w') as f:
    f.write(c)
