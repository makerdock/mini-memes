import { type Canvas } from 'fabric';
import { create } from 'zustand';

// Define the EditorStore
interface EditorState {
  // editor: FabricJSEditor | null;
  // onReady: (editor: FabricJSEditor) => void;
  canvas: Canvas | null;
  setCanvas: (canvas: Canvas) => void;
  activeTextId: string | null;
  setActiveTextId: (id: string | null) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  canvas: null,
  setCanvas: (canvas) => set({ canvas }),
  activeTextId: null,
  setActiveTextId: (id) => set({ activeTextId: id }),
}));
