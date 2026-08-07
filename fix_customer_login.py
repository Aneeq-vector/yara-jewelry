with open('src/app/auth/login/page.tsx', 'r') as f:
    c = f.read()

# Remove the useAdminAuthStore import
c = c.replace("import { useAdminAuthStore } from '@/lib/store/admin-auth-store';\n", "")

# Change handleSubmit
old_submit = """      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      
      const result = await loginAction(formData);
      
      if (result.error) {
        alert(result.error);
        return;
      }
      
      // Sync client state depending on role
      if (result.user?.role === 'admin') {
        useAdminAuthStore.setState({ user: result.user as any, isAuthenticated: true });
      } else {
        useAuthStore.setState({ user: result.user as any, isAuthenticated: true });
      }"""

new_submit = """      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('expectedRole', 'customer');
      
      const result = await loginAction(formData);
      
      if (result.error) {
        alert(result.error);
        return;
      }
      
      // Sync client state
      useAuthStore.setState({ user: result.user as any, isAuthenticated: true });"""

c = c.replace(old_submit, new_submit)

# Change routing at end of submit
old_routing = """      if (result.user?.role === 'admin') {
        router.push('/yara-admin');
      } else {
        router.push('/dashboard');
      }"""

new_routing = """      router.push('/dashboard');"""

c = c.replace(old_routing, new_routing)

with open('src/app/auth/login/page.tsx', 'w') as f:
    f.write(c)

