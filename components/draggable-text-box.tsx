import React from 'react';
import { MemeText } from './meme-generator';
import { motion, useDragControls } from 'motion/react';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

interface DraggableTextBoxProps {
    item: MemeText;
    containerRef: React.RefObject<HTMLDivElement>;
    updateCustomTextPosition: (id: string, x: number, y: number) => void;
    updateCustomTextSize: (id: string, size: number) => void;
    selectCustomText: (id: string) => void;
    selected: boolean;
}
const DraggableTextBox: React.FC<DraggableTextBoxProps> = ({
    containerRef,
    item,
    updateCustomTextPosition,
    updateCustomTextSize,
    selectCustomText,
    selected,
}) => {
    const controls = useDragControls();

    const handleIncreaseSize = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const newSize = Math.min(item.size + 8, 72); // Max size 72px
        // setFontSize(newSize);
        updateCustomTextSize(item.areaId, newSize);
    };

    const handleDecreaseSize = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const newSize = Math.max(item.size - 8, 12); // Min size 12px
        // setFontSize(newSize);
        updateCustomTextSize(item.areaId, newSize);
    };

    return (
        <motion.span
            drag
            key={item.areaId}
            onClick={() => selectCustomText(item.areaId)}
            dragControls={controls}
            dragMomentum={false}
            // initial={{ x: item.x, y: item.y }}
            dragConstraints={containerRef}
            onPointerDown={() => updateCustomTextPosition(item.areaId, item.x, item.y)}
            className='relative inline-block bg-red-100'
        >
            {selected && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/70 rounded-md p-1">
                    <button
                        onClick={handleDecreaseSize}
                        className="text-white hover:text-yellow-300 p-1 rounded-full"
                        aria-label="Decrease text size"
                    >
                        <ArrowDownIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleIncreaseSize}
                        className="text-white hover:text-yellow-300 p-1 rounded-full"
                        aria-label="Increase text size"
                    >
                        <ArrowUpIcon className="h-4 w-4" />
                    </button>
                </div>
            )}
            <span
                style={{ fontSize: item.size }}
                className='font-impact font-outline-2 uppercase'>{item.text}</span>
        </motion.span>
    );
};

export default DraggableTextBox;