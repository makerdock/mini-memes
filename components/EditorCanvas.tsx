'use client';

import { useEditorStore } from '@/stores/useEditorStore';
import classNames from 'classnames';
import { Image as FabricImage, Text as FabricText, type Canvas } from 'fabric';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import { useEffect } from 'react';
import { MemeTemplate } from './MemeBuilder';

// import { useCanvasStore } from '~/store/useCanvasStore';
// import { useEditorStore } from '~/store/useEditorStore';
// import { canvasOperations } from '~/utils/canvasOperations';

interface EditorCanvasProps {
  className?: string;
  template?: MemeTemplate;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({ className, template }) => {
  const { editor, onReady } = useFabricJSEditor();
  const { setCanvas, setActiveTextId } = useEditorStore();

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
    const img = new FabricImage(fabricImage);
    img.set({
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
    canvas.setWidth(containerWidth);
    canvas.setHeight(canvasHeight);

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
      await setBackground(canvas, template?.imageUrl || '');

      // add the text boxes to the canvas
      template?.textOverlays.forEach((textBox) => {
        canvas.add(new FabricText(textBox.text, {
          left: textBox.x,
          top: textBox.y,
          fontSize: textBox.size,
          fontFamily: 'Impact',
          fill: 'white',
          stroke: 'black',
          strokeWidth: 2,
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
          // preserve aspect ratio
          scaleX: 1,
          scaleY: 1,
          lockUniScaling: true,
          // disable resizing
          lockScalingX: true,
          lockScalingY: true,
          // hide control points
          hasControls: false,
          hasBorders: false,
          // keep origin points
          originX: 'left',
          originY: 'top',

          data: {
            areaId: textBox.areaId,
          }
        }));
      });

      onReady(canvas);
    } catch (error) {
      console.error('Failed to restore canvas state:', error);
    }
  };


  useEffect(() => {
    if (editor) {
      setCanvas(editor.canvas);
    }

    // add a listener foor when an object is active
    editor?.canvas.on('selection:created', (e) => {
      const selectedObject = e.selected?.[0];
      console.log("🚀 ~ editor?.canvas.on ~ e.selected:", e.selected);
      console.log("🚀 ~ editor?.canvas.on ~ selectedObject:", selectedObject);
      console.log("🚀 ~ editor?.canvas.on ~ selectedObject.data.areaId:", selectedObject.data.areaId);

      if (selectedObject && selectedObject.data?.areaId) {
        setActiveTextId(selectedObject.data.areaId);
      }
    });

    editor?.canvas.on('selection:cleared', () => {
      setActiveTextId(null);
    });
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
