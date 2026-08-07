with open('src/app/actions/auth.ts', 'r') as f:
    c = f.read()

target = """    if (authData.record.status === 'Inactive') {
      pb.authStore.clear();
      return { error: 'cannot login kindly contact customer support' };
    }"""

replacement = """    if (authData.record.status === 'Inactive') {
      pb.authStore.clear();
      return { error: 'cannot login kindly contact customer support' };
    }
    
    const expectedRole = data.expectedRole || 'customer';
    if (authData.record.role !== expectedRole) {
      pb.authStore.clear();
      return { error: `Access denied. Please login via the correct portal.` };
    }"""

c = c.replace(target, replacement)

with open('src/app/actions/auth.ts', 'w') as f:
    f.write(c)

