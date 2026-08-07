import re

with open("src/app/yara-admin/gift-boxes/page.tsx", "r") as f:
    content = f.read()

# 1. Add useReducer to imports
content = re.sub(
    r"import \{ useState, useEffect, useMemo, useRef \} from 'react';",
    "import { useState, useEffect, useMemo, useRef, useReducer } from 'react';",
    content
)

# 2. Add Reducer definitions above the component
reducer_code = """
interface EditorState {
  editorCategory: string;
  selectedItems: Set<string>;
  productSearch: string;
  isActive: boolean;
  pendingImage: File | null;
  previewUrl: string;
  saveStatus: SaveStatus;
}

type EditorAction =
  | { type: 'LOAD_BOX'; payload: RawBox }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'TOGGLE_ITEM'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'TOGGLE_ACTIVE' }
  | { type: 'SET_IMAGE'; payload: { file: File | null; previewUrl: string } }
  | { type: 'SET_SAVE_STATUS'; payload: SaveStatus }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'CLEAR_ITEMS' };

const initialEditorState: EditorState = {
  editorCategory: '',
  selectedItems: new Set(),
  productSearch: '',
  isActive: true,
  pendingImage: null,
  previewUrl: '',
  saveStatus: 'idle',
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'LOAD_BOX':
      return {
        ...state,
        editorCategory: '',
        selectedItems: new Set(action.payload.fixed_items),
        isActive: action.payload.is_active,
        pendingImage: null,
        previewUrl: action.payload.images[0] || '',
        saveStatus: 'idle',
        productSearch: '',
      };
    case 'SET_CATEGORY':
      return { ...state, editorCategory: action.payload, productSearch: '' };
    case 'TOGGLE_ITEM': {
      const next = new Set(state.selectedItems);
      if (next.has(action.payload)) next.delete(action.payload);
      else next.add(action.payload);
      return { ...state, selectedItems: next };
    }
    case 'SET_SEARCH':
      return { ...state, productSearch: action.payload };
    case 'TOGGLE_ACTIVE':
      return { ...state, isActive: !state.isActive };
    case 'SET_IMAGE':
      return { ...state, pendingImage: action.payload.file, previewUrl: action.payload.previewUrl };
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };
    case 'SAVE_SUCCESS':
      return { ...state, pendingImage: null, saveStatus: 'success' };
    case 'CLEAR_ITEMS':
      return { ...state, selectedItems: new Set() };
    default:
      return state;
  }
}

export default function GiftBoxesAdminPage() {
"""
content = content.replace("export default function GiftBoxesAdminPage() {", reducer_code)

# 3. Replace useState declarations with useReducer
old_states = """  // Editor state
  const [editorCategory, setEditorCategory] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [productSearch, setProductSearch] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');"""
new_states = """  // Editor state
  const [editorState, dispatch] = useReducer(editorReducer, initialEditorState);
  const { editorCategory, selectedItems, productSearch, isActive, pendingImage, previewUrl, saveStatus } = editorState;"""
content = content.replace(old_states, new_states)

# 4. Replace LOAD_BOX block
old_load = """    setEditorCategory(''); // Default to showing all categories
    setSelectedItems(new Set(selectedBox.fixed_items));
    setIsActive(selectedBox.is_active);
    setPendingImage(null);
    setPreviewUrl(selectedBox.images[0] || '');
    setSaveStatus('idle');
    setProductSearch('');"""
new_load = """    dispatch({ type: 'LOAD_BOX', payload: selectedBox });"""
content = content.replace(old_load, new_load)

# 5. toggleItem function
old_toggle = """  const toggleItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };"""
new_toggle = """  const toggleItem = (id: string) => {
    dispatch({ type: 'TOGGLE_ITEM', payload: id });
  };"""
content = content.replace(old_toggle, new_toggle)

# 6. handleImageChange
old_image = """    setPendingImage(file);
    setPreviewUrl(URL.createObjectURL(file));"""
new_image = """    dispatch({ type: 'SET_IMAGE', payload: { file, previewUrl: URL.createObjectURL(file) } });"""
content = content.replace(old_image, new_image)

# 7. handleSave updates
content = content.replace("setSaveStatus('saving');", "dispatch({ type: 'SET_SAVE_STATUS', payload: 'saving' });")
content = content.replace("setPendingImage(null);\n      setSaveStatus('success');", "dispatch({ type: 'SAVE_SUCCESS' });")
content = content.replace("setTimeout(() => setSaveStatus('idle'), 3000);", "setTimeout(() => dispatch({ type: 'SET_SAVE_STATUS', payload: 'idle' }), 3000);")
content = content.replace("setSaveStatus('error');", "dispatch({ type: 'SET_SAVE_STATUS', payload: 'error' });")
content = content.replace("setTimeout(() => setSaveStatus('idle'), 4000);", "setTimeout(() => dispatch({ type: 'SET_SAVE_STATUS', payload: 'idle' }), 4000);")

# 8. Inline toggles and sets
content = content.replace("onClick={() => setIsActive((v) => !v)}", "onClick={() => dispatch({ type: 'TOGGLE_ACTIVE' })}")
content = content.replace("""                      setEditorCategory(e.target.value);
                      setProductSearch('');""", "                      dispatch({ type: 'SET_CATEGORY', payload: e.target.value });")
content = content.replace("onClick={() => setSelectedItems(new Set())}", "onClick={() => dispatch({ type: 'CLEAR_ITEMS' })}")
content = content.replace("onChange={(e) => setProductSearch(e.target.value)}", "onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}")


with open("src/app/yara-admin/gift-boxes/page.tsx", "w") as f:
    f.write(content)
