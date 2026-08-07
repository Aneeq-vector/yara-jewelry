import re

def update_login_page(filepath):
    with open(filepath, 'r') as f:
        c = f.read()

    # Add error state
    if "const [error, setError] = useState<string | null>(null);" not in c:
        c = c.replace("const [loading, setLoading] = useState(false);", "const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);")

    # Replace alert with setError
    target_alert = """      if (result.error) {
        alert(result.error);
        return;
      }"""
    replacement_alert = """      if (result.error) {
        setError(result.error.includes('Failed to authenticate') ? 'Invalid email or password.' : result.error);
        return;
      }"""
    c = c.replace(target_alert, replacement_alert)
    
    # Add setError(null) at start of submit
    if "setError(null);" not in c:
        c = c.replace("setLoading(true);", "setError(null);\n    setLoading(true);")

    # Add error UI above the first input
    target_form = """          <form onSubmit={handleSubmit} className="space-y-6">"""
    replacement_form = """          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-red-50 text-red-600 text-sm font-body px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                {error}
              </motion.div>
            )}"""
    
    c = c.replace(target_form, replacement_form)

    with open(filepath, 'w') as f:
        f.write(c)

update_login_page('src/app/auth/login/page.tsx')
update_login_page('src/app/yara-admin/login/page.tsx')

