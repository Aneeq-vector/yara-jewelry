import os
import re
import uuid

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
        
    original_content = content

    # Find all labels without htmlFor
    label_pattern = re.compile(r'<([lL]abel)(?![^>]*htmlFor)[^>]*>(.*?)</\1>', re.DOTALL)
    
    # We will build the new content string
    # We iterate over matches in reverse so indices don't shift
    matches = list(label_pattern.finditer(content))
    
    count = 0
    for m in reversed(matches):
        label_full = m.group(0)
        label_tag = m.group(1)
        label_content = m.group(2)
        end_idx = m.end()
        
        # Search forward for the next input, textarea, select
        # also search for next label to avoid crossing boundaries
        next_input_match = re.search(r'<(input|textarea|select)[^>]*>', content[end_idx:])
        next_label_match = re.search(r'<[lL]abel[^>]*>', content[end_idx:])
        
        if next_input_match:
            input_full = next_input_match.group(0)
            tag_name = next_input_match.group(1)
            
            # If there's another label before this input, skip
            if next_label_match and next_label_match.start() < next_input_match.start():
                # wait, maybe it's fine if we are just adding ID?
                # actually, to be safe, if we hit another label, we shouldn't cross it
                continue
                
            input_start = end_idx + next_input_match.start()
            input_end = end_idx + next_input_match.end()
            
            # Check if input already has an id
            id_match = re.search(r'\bid=(["\'])(.*?)\1', input_full)
            if id_match:
                id_val = id_match.group(2)
                # just add htmlFor to the label
                new_label = label_full.replace(f'<{label_tag}', f'<{label_tag} htmlFor="{id_val}"', 1)
                
                content = content[:m.start()] + new_label + content[m.end():]
                count += 1
            else:
                # generate id
                clean_text = re.sub(r'[^a-zA-Z0-9]', '', label_content).lower()
                if not clean_text or len(clean_text) > 20:
                    clean_text = "field"
                new_id = f"{clean_text}_{uuid.uuid4().hex[:6]}"
                
                new_label = label_full.replace(f'<{label_tag}', f'<{label_tag} htmlFor="{new_id}"', 1)
                new_input = input_full.replace(f'<{tag_name}', f'<{tag_name} id="{new_id}"', 1)
                
                # replace input first (since it's after label, it doesn't affect label's start index)
                content = content[:input_start] + new_input + content[input_end:]
                # replace label
                content = content[:m.start()] + new_label + content[m.end():]
                count += 1

    if count > 0 and content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {count} labels in {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
