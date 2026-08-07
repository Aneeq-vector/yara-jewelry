import os
import re

def fix_json_clone(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root or '.git' in root or '.next' in root:
            continue
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.mjs')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace JSON.parse(JSON.stringify(x)) with structuredClone(x)
                # Need to handle variables carefully
                new_content = re.sub(r'JSON\.parse\(\s*JSON\.stringify\(([^)]+)\)\s*\)', r'structuredClone(\1)', content)
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed {path}")

fix_json_clone('.')
