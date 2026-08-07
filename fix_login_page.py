import re

with open('src/app/auth/login/page.tsx', 'r') as f:
    c = f.read()

# Replace the formData.append for expectRole to include remember
target_submit = """      formData.append('expectedRole', 'customer');"""
replacement_submit = """      formData.append('expectedRole', 'customer');
      formData.append('remember', remember ? 'true' : 'false');"""

c = c.replace(target_submit, replacement_submit)

# Add import for requestPasswordResetAction if not there
if "requestPasswordResetAction" not in c:
    c = c.replace("import { loginAction } from '@/app/actions/auth';", "import { loginAction, requestPasswordResetAction } from '@/app/actions/auth';")

# Add handleForgotPassword function
target_handle = """  const handleSubmit = async (e: React.FormEvent) => {"""
replacement_handle = """  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }
    const confirm = window.confirm(`Send password reset email to ${email}?`);
    if (!confirm) return;
    
    setLoading(true);
    const result = await requestPasswordResetAction(email);
    setLoading(false);
    
    if (result.success) {
      alert("Password reset email sent! Check your inbox.");
    } else {
      alert(result.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {"""

c = c.replace(target_handle, replacement_handle)

# Wire up the Forgot Password button
target_btn = """              <button type="button" className="font-ui text-xs font-bold uppercase tracking-wider text-rose-gold hover:text-wine transition-colors">
                Forgot Password?
              </button>"""
replacement_btn = """              <button type="button" onClick={handleForgotPassword} className="font-ui text-xs font-bold uppercase tracking-wider text-rose-gold hover:text-wine transition-colors">
                Forgot Password?
              </button>"""

c = c.replace(target_btn, replacement_btn)

with open('src/app/auth/login/page.tsx', 'w') as f:
    f.write(c)

