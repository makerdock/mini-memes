'use client';

import { useEditorStore } from '@/stores/useEditorStore';
import classNames from 'classnames';
import { type Canvas } from 'fabric';
import { install } from 'fabricjs-extension';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import { useEffect, useState } from 'react';

// import { useCanvasStore } from '~/store/useCanvasStore';
// import { useEditorStore } from '~/store/useEditorStore';
// import { canvasOperations } from '~/utils/canvasOperations';

interface EditorCanvasProps {
  className?: string;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({ className }) => {
  const { editor, onReady } = useFabricJSEditor();
  const { setCanvas } = useEditorStore();
  // const { selectedSize } = useCanvasStore();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleCanvasReady = async (canvas: Canvas) => {
    try {
      // Apply the extension with custom configuration
      install(canvas, {
        actionsToInstall: {
          zoomWithPinch: true,
        },
      });

      // const cachedCanvasDataFromLs = localStorage.getItem('remoteCanvasData');

      // if (cachedCanvasDataFromLs) {
      //   await canvasOperations.restoreCanvasState(
      //     canvas,
      //     canvasOperations.parseCanvasData(cachedCanvasDataFromLs),
      //   );
      // }

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

  if (isRefreshing) {
    return <div className='aspect-square h-full w-full'></div>;
  }

  return (
    <FabricJSCanvas
      className={classNames(
        'editor-canvas aspect-square h-full w-full overflow-hidden',
        className,
      )}
      onReady={handleCanvasReady}
    />
  );
};

export default EditorCanvas;
