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
        // Check if textbox exists first
        const currTemplate = get().selectedTemplate;
        const existingTextbox = currTemplate?.textOverlays.find((item: MemeText) => item.areaId === id);

        if (!existingTextbox) {
            // This is a new textbox - add it instead of updating
            const fullTextbox: MemeText = {
                areaId: id,
                text: updates.text || 'New text',
                font: updates.font || 'Impact',
                size: updates.size || 32,
                color: updates.color || '#ffffff',
                x: updates.x || 250,
                y: updates.y || 250
            };
            if (currTemplate) {
                const updatedTemplate: MemeTemplate = {
                    ...currTemplate,
                    textOverlays: [...currTemplate.textOverlays, fullTextbox]
                };
                set({ selectedTemplate: updatedTemplate });
            }
            return;
        }

        // Update existing textbox
        if (currTemplate) {
            const updatedTemplate: MemeTemplate = {
                ...currTemplate,
                textOverlays: currTemplate.textOverlays.map((item: MemeText) => {
                    if (item.areaId === id) {
                        return {
                            ...item,
                            ...updates
                        };
                    }
                    return item;
                })
            };
            set({ selectedTemplate: updatedTemplate });
        }
    },
    addTextOverlay: (textOverlay) => {
        const currTemplate = get().selectedTemplate;
        if (currTemplate) {
            const updatedTemplate: MemeTemplate = {
                ...currTemplate,
                textOverlays: [...currTemplate.textOverlays, textOverlay]
            };
            set({ selectedTemplate: updatedTemplate });
        }
    },
    removeTextOverlay: (id) => {
        const currTemplate = get().selectedTemplate;
        if (currTemplate) {
            const updatedTemplate: MemeTemplate = {
                ...currTemplate,
                textOverlays: currTemplate.textOverlays.filter((item: MemeText) => item.areaId !== id)
            };
            set({ selectedTemplate: updatedTemplate });
        }
    }
}));