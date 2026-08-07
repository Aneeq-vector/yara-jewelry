import re

file_path = "src/app/yara-admin/gift-boxes/page.tsx"
with open(file_path, "r") as f:
    content = f.read()

reducer_code = """
type EditorState = {
  category: string;
  items: Set<string>;
  search: string;
  isActive: boolean;
  pendingImage: File | null;
  previewUrl: string;
  saveStatus: SaveStatus;
};

type EditorAction = 
  | { type: 'LOAD_BOX'; payload: Partial<EditorState> }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_ITEMS'; payload: Set<string> | ((prev: Set<string>) => Set<string>) }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_ACTIVE'; payload: boolean | ((prev: boolean) => boolean) }
  | { type: 'SET_IMAGE'; payload: { file: File | null; url: string } }
  | { type: 'SET_SAVE_STATUS'; payload: SaveStatus };

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'LOAD_BOX': return { ...state, ...action.payload };
    case 'SET_CATEGORY': return { ...state, category: action.payload };
    case 'SET_ITEMS': return { ...state, items: typeof action.payload === 'function' ? action.payload(state.items) : action.payload };
    case 'SET_SEARCH': return { ...state, search: action.payload };
    case 'SET_ACTIVE': return { ...state, isActive: typeof action.payload === 'function' ? action.payload(state.isActive) : action.payload };
    case 'SET_IMAGE': return { ...state, pendingImage: action.payload.file, previewUrl: action.payload.url };
    case 'SET_SAVE_STATUS': return { ...state, saveStatus: action.payload };
    default: return state;
  }
}
"""

# Insert reducer_code before `export default function GiftBoxesAdminPage()`
content = content.replace("export default function GiftBoxesAdminPage() {", reducer_code + "\nexport default function GiftBoxesAdminPage() {")

# Replace useStates with useReducer
state_defs = """  // Editor state
  const [editorCategory, setEditorCategory] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [productSearch, setProductSearch] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');"""

new_state_defs = """  const [{ category: editorCategory, items: selectedItems, search: productSearch, isActive, pendingImage, previewUrl, saveStatus }, dispatch] = React.useReducer(editorReducer, {
    category: '',
    items: new Set<string>(),
    search: '',
    isActive: true,
    pendingImage: null,
    previewUrl: '',
    saveStatus: 'idle'
  });"""

content = content.replace(state_defs, new_state_defs)

# Add React import if needed
if "import React" not in content:
    content = content.replace("import { useState", "import React, { useState")

# Replace setters in useEffect
old_use_effect = """    setEditorCategory(''); // Default to showing all categories
    setSelectedItems(new Set(selectedBox.fixed_items));
    setIsActive(selectedBox.is_active);
    setPendingImage(null);
    setPreviewUrl(selectedBox.images[0] || '');
    setSaveStatus('idle');
    setProductSearch('');"""

new_use_effect = """    dispatch({
      type: 'LOAD_BOX',
      payload: {
        category: '',
        items: new Set(selectedBox.fixed_items),
        isActive: selectedBox.is_active,
        pendingImage: null,
        previewUrl: selectedBox.images[0] || '',
        saveStatus: 'idle',
        search: ''
      }
    });"""

content = content.replace(old_use_effect, new_use_effect)

# Replace individual setters
content = re.sub(r'setEditorCategory\(([^)]+)\)', r"dispatch({ type: 'SET_CATEGORY', payload: \1 })", content)
content = re.sub(r'setSelectedItems\(([^)]+)\)', r"dispatch({ type: 'SET_ITEMS', payload: \1 })", content)
content = re.sub(r'setSelectedItems\(\(prev\) => \{', r"dispatch({ type: 'SET_ITEMS', payload: (prev) => {", content)
content = re.sub(r'setProductSearch\(([^)]+)\)', r"dispatch({ type: 'SET_SEARCH', payload: \1 })", content)
content = re.sub(r'setIsActive\(([^)]+)\)', r"dispatch({ type: 'SET_ACTIVE', payload: \1 })", content)
content = re.sub(r'setSaveStatus\(([^)]+)\)', r"dispatch({ type: 'SET_SAVE_STATUS', payload: \1 })", content)

# Handle setPendingImage and setPreviewUrl used together
old_image_setters = """    setPendingImage(file);
    setPreviewUrl(URL.createObjectURL(file));"""
new_image_setters = """    dispatch({ type: 'SET_IMAGE', payload: { file, url: URL.createObjectURL(file) } });"""
content = content.replace(old_image_setters, new_image_setters)

content = content.replace("setPendingImage(null);", "dispatch({ type: 'SET_IMAGE', payload: { file: null, url: previewUrl } });")

with open(file_path, "w") as f:
    f.write(content)
