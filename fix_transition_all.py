import os
import re

def fix_transition_all(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root or '.git' in root or '.next' in root:
            continue
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.css')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace 'transition-all' with 'transition'
                # Be careful not to replace it if it's already 'transition'
                # Word boundaries help here: \btransition-all\b
                new_content = re.sub(r'\btransition-all\b', 'transition', content)
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed {path}")

fix_transition_all('./src')
