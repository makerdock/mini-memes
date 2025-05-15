import { create } from 'zustand';
import type { MemeTemplate, MemeText } from '../../components/meme-generator';
import { MEME_TEMPLATES } from '../meme-templates';

interface MemeStore {
    selectedTemplate: MemeTemplate;
    selectedCustomTextId: string | null;
    generatedMeme: string | null;
    activeTab: string;
    setSelectedTemplate: (template: MemeTemplate) => void;
    setSelectedCustomTextId: (id: string | null) => void;
    setGeneratedMeme: (meme: string | null) => void;
    setActiveTab: (tab: string) => void;
    updateActiveTextbox: (id: string, update: Partial<MemeText>) => void;
}

export const useMemeStore = create<MemeStore>((set, get) => ({
    selectedTemplate: MEME_TEMPLATES[0],
    customTextItems: [],
    selectedCustomTextId: null,
    generatedMeme: null,
    activeTab: 'create',
    setSelectedTemplate: (template) => set({ selectedTemplate: template }),
    setSelectedCustomTextId: (id) => set({ selectedCustomTextId: id }),
    setGeneratedMeme: (meme) => set({ generatedMeme: meme }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    updateActiveTextbox: (id, updates) => {
        console.log("🚀 ~ updates:", updates);

        const currTemplate = get().selectedTemplate;
        const updatedTemplate = {
            ...currTemplate,
            textOverlays: currTemplate.textOverlays.map((item) => {
                if (item.areaId === id) {
                    return {
                        ...item,
                        ...updates
                    };
                }
                return item;
            })
        };

        console.log("🚀 ~ updatedTemplate:", updatedTemplate);
        set({ selectedTemplate: updatedTemplate });
    }
}));