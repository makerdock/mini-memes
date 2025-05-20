import { MemeTemplate, MemeText } from '@/components/MemeBuilder';
import { MEME_TEMPLATES } from '@/lib/meme-templates';
import { create } from 'zustand';

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
    addTextOverlay: (textOverlay: MemeText) => void;
    removeTextOverlay: (id: string) => void;
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
        // Check if textbox exists first
        const currTemplate = get().selectedTemplate;
        const existingTextbox = currTemplate.textOverlays.find(item => item.areaId === id);

        if (!existingTextbox) {
            // This is a new textbox - add it instead of updating
            const fullTextbox: MemeText = {
                areaId: id,
                text: updates.text || 'New text',
                font: updates.font || 'Impact',
                fontSize: updates.fontSize || 32,
                color: updates.color || '#ffffff',
                x: updates.x || 250,
                y: updates.y || 250,
                height: updates.height || 300,
                width: updates.width || 100
            };

            const updatedTemplate = {
                ...currTemplate,
                textOverlays: [...currTemplate.textOverlays, fullTextbox]
            };

            set({ selectedTemplate: updatedTemplate });
            return;
        }

        // Update existing textbox
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

        set({ selectedTemplate: updatedTemplate });
    },
    addTextOverlay: (textOverlay) => {
        const currTemplate = get().selectedTemplate;
        const updatedTemplate = {
            ...currTemplate,
            textOverlays: [...currTemplate.textOverlays, textOverlay]
        };

        set({ selectedTemplate: updatedTemplate });
    },
    removeTextOverlay: (id) => {
        const currTemplate = get().selectedTemplate;
        const updatedTemplate = {
            ...currTemplate,
            textOverlays: currTemplate.textOverlays.filter((item) => item.areaId !== id)
        };

        set({ selectedTemplate: updatedTemplate });
    }
}));