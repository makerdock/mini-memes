import type { MemeTemplate, MemeText } from '@/lib/meme-templates';
import { create } from 'zustand';

interface MemeStore {
    selectedTemplate: MemeTemplate | null;
    selectedCustomTextId: string | null;
    generatedMeme: string | null;
    activeTab: string;
    setSelectedTemplate: (template: MemeTemplate) => void;
    setSelectedCustomTextId: (id: string | null) => void;
    setGeneratedMeme: (meme: string | null) => void;
    setActiveTab: (tab: string) => void;
    updateActiveTextbox: (id: string, update: Partial<MemeText>) => void;
    addTextOverlay: (textOverlay: MemeText) => void;
    removeTextOverlay: (id: string) => void;
}

export const useMemeStore = create<MemeStore>((set, get) => ({
    selectedTemplate: null,
    customTextItems: [],
    selectedCustomTextId: null,
    generatedMeme: null,
    activeTab: 'create',
    setSelectedTemplate: (template) => set({ selectedTemplate: template }),
    setSelectedCustomTextId: (id) => set({ selectedCustomTextId: id }),
    setGeneratedMeme: (meme) => set({ generatedMeme: meme }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    updateActiveTextbox: (id, updates) => {
        // Updates to text boxes should be handled via Fabric.js methods in the editor component.
        // This store should not attempt to update properties on Fabric.js IText objects directly.
        return;
    },
    addTextOverlay: (textOverlay) => {
        const currTemplate = get().selectedTemplate;
        if (currTemplate) {
            const updatedTemplate: MemeTemplate = {
                ...currTemplate,
                text_boxes: [...currTemplate.text_boxes, textOverlay]
            };
            set({ selectedTemplate: updatedTemplate });
        }
    },
    removeTextOverlay: (id) => {
        const currTemplate = get().selectedTemplate;
        if (currTemplate) {
            const updatedTemplate: MemeTemplate = {
                ...currTemplate,
                text_boxes: currTemplate.text_boxes.filter((item: MemeText) => item.text !== id)
            };
            set({ selectedTemplate: updatedTemplate });
        }
    }
}));