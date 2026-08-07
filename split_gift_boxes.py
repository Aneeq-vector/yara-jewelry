import os

with open('src/app/yara-admin/gift-boxes/page.tsx', 'r') as f:
    lines = f.readlines()

# Extract lines 313 to 352 (0-indexed)
selector_lines = lines[313:353]
selector_str = ''.join(selector_lines)

component_str = """
function GiftBoxSelector({ boxes, selectedBoxId, setSelectedBoxId }: any) {
  return (
""" + selector_str + """
  );
}
"""

# Replace in original lines
new_lines = lines[:313] + ["        <GiftBoxSelector boxes={boxes} selectedBoxId={selectedBoxId} setSelectedBoxId={setSelectedBoxId} />\n"] + lines[353:]

# Find export default function
for i, line in enumerate(new_lines):
    if line.startswith('export default function GiftBoxesAdminPage() {'):
        new_lines.insert(i, component_str)
        break

with open('src/app/yara-admin/gift-boxes/page.tsx', 'w') as f:
    f.writelines(new_lines)
