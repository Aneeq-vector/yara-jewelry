import re

with open('src/app/auth/login/page.tsx', 'r') as f:
    c = f.read()

# Add Check to lucide-react imports
if "Check," not in c:
    c = c.replace("import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';", "import { Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';")

target_box = """                <div className="relative flex items-center justify-center w-4 h-4 rounded border border-burgundy/30 group-hover:border-burgundy transition-colors">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="absolute opacity-0 w-full h-full cursor-pointer"
                  />
                  {remember && <div className="w-2 h-2 rounded-sm bg-burgundy" />}
                </div>"""

replacement_box = """                <div className={`relative flex items-center justify-center w-5 h-5 rounded shrink-0 border transition-all duration-200 ${remember ? 'bg-burgundy border-burgundy text-white' : 'border-burgundy/30 bg-transparent group-hover:border-burgundy'}`}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {remember && <Check size={14} strokeWidth={3} className="animate-in zoom-in duration-200" />}
                </div>"""

c = c.replace(target_box, replacement_box)

with open('src/app/auth/login/page.tsx', 'w') as f:
    f.write(c)
