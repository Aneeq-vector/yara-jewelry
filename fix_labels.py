import os
import re
import uuid

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Pattern explanation:
    # Group 1: <label or <Label (without htmlFor)
    # Group 2: The content inside the label
    # Group 3: </label> or </Label> followed by whitespace
    # Group 4: <input or <textarea or <select
    pattern = re.compile(r'(<[lL]abel(?![^>]*htmlFor)[^>]*>)(.*?)(</[lL]abel>\s*)(<(?:input|textarea|select)[^>]*)', re.DOTALL)
    
    def repl(m):
        label_open = m.group(1)
        label_content = m.group(2)
        label_close = m.group(3)
        input_tag = m.group(4)
        
        # Does the input already have an id?
        id_match = re.search(r'\bid=(["\'])(.*?)\1', input_tag)
        if id_match:
            id_val = id_match.group(2)
            # just add htmlFor to label
            # insert htmlFor="id_val" before the closing >
            new_label = label_open[:-1] + f' htmlFor="{id_val}">'
            return new_label + label_content + label_close + input_tag
        else:
            # generate unique id based on the label text
            # clean label text to form an id
            clean_text = re.sub(r'[^a-zA-Z0-9]', '', label_content).lower()
            if not clean_text or len(clean_text) > 20:
                clean_text = "field"
            new_id = f"{clean_text}_{uuid.uuid4().hex[:6]}"
            new_label = label_open[:-1] + f' htmlFor="{new_id}">'
            
            # append id="new_id" to input_tag
            # <input becomes <input id="new_id"
            tag_name_match = re.search(r'<(input|textarea|select)', input_tag)
            if tag_name_match:
                tag_name = tag_name_match.group(0)
                new_input = input_tag.replace(tag_name, f'{tag_name} id="{new_id}"', 1)
                return new_label + label_content + label_close + new_input
            return m.group(0) # fallback

    new_content, count = pattern.subn(repl, content)
    
    if count > 0:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {count} labels in {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
