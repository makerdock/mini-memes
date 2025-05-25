'use client';

import { getDefaultTextBoxProps } from '@/lib/fabric-defaults';
import { MemeTemplate } from '@/lib/meme-templates';
import { useEditorStore } from '@/stores/useEditorStore';
import classNames from 'classnames';
import { FabricImage, FabricText, type Canvas } from 'fabric';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import { useEffect } from 'react';

// import { useCanvasStore } from '~/store/useCanvasStore';
// import { useEditorStore } from '~/store/useEditorStore';
// import { canvasOperations } from '~/utils/canvasOperations';

interface EditorCanvasProps {
  className?: string;
  template?: MemeTemplate;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({ className, template }) => {
  const { editor, onReady } = useFabricJSEditor();
  const { setCanvas } = useEditorStore();
  // const { selectedSize } = useCanvasStore();
  // const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const setBackground = async (canvas: Canvas, imageUrl: string) => {
    // fetch the image from the template
    const image = await fetch(imageUrl || '');
    const imageBlob = await image.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);

    // create a new Fabric.js image instance from the blob
    const fabricImage = new Image();
    fabricImage.src = imageObjectURL;
    // wait for the image to load
    await new Promise((resolve) => {
      fabricImage.onload = resolve;
    });
    // create a new Fabric.js image instance from the blob
    // 
    // @ts-ignore 
    const img = new FabricImage(fabricImage, {
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      lockUniScaling: true,
      objectCaching: false,
      skipOffscreen: true,
    });

    // get the dimensions of the image
    const imgWidth = img.width || 0;
    const imgHeight = img.height || 0;

    // get the width of canvas container element
    const canvasDom = document.querySelector('.canvas-container');
    const parentElement = canvasDom!.parentElement;
    const containerWidth = parentElement ? parentElement.clientWidth : 0;

    // Calculate height while maintaining aspect ratio
    const bgImageAspectRatio = imgWidth / imgHeight;
    const canvasHeight = containerWidth / bgImageAspectRatio;

    // Set canvas dimensions
    // canvas.setWidth(containerWidth);
    // canvas.setHeight(canvasHeight);
    canvas.setDimensions({ width: containerWidth, height: canvasHeight });

    // add the image to the canvas
    canvas.add(img);

    // scale image to fit canvas
    img.scaleToWidth(containerWidth);
    img.scaleToHeight(canvasHeight);

    // center the image on the canvas
    img.set({ left: 0, top: 0 });
  };

  const handleCanvasReady = async (canvas: Canvas) => {
    try {
      await setBackground(canvas, template?.image_url || '');

      try {
        // add the text boxes to the canvas
        template?.text_boxes.forEach(({ text, ...textBox }) => {
          canvas.add(new FabricText(text, {
            ...getDefaultTextBoxProps(),
            ...textBox,
          }));
        });
      } catch (error) {
        console.error(error);
      }

      onReady(canvas);
    } catch (error) {
      console.error('Failed to restore canvas state:', error);
    }
  };

  useEffect(() => {
    if (editor) {
      setCanvas(editor.canvas);
    }
  }, [editor, setCanvas]);

  return (
    <FabricJSCanvas
      className={classNames(
        'editor-canvas h-full w-full overflow-hidden',
        className,
      )}
      onReady={handleCanvasReady}
    />
  );
};

export default EditorCanvas;
