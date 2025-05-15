// Simple type definitions for Fabric.js
declare module 'fabric' {
  export class Canvas {
    constructor(elementId: string, options?: any);
    dispose(): void;
    setWidth(width: number): void;
    setHeight(height: number): void;
    getWidth(): number;
    getHeight(): number;
    clear(): void;
    add(object: any): void;
    remove(object: any): void;
    renderAll(): void;
    setActiveObject(object: any): void;
    getObjects(): any[];
    bringForward(object: any): void;
    sendBackwards(object: any): void;
    sendToBack(object: any): void;
    on(event: string, callback: Function): void;
    toDataURL(options?: any): string;
  }

  export class Text {
    constructor(text: string, options?: any);
    set(property: string | object, value?: any): Text;
    text: string;
    fontSize: number;
    fontWeight: string;
    fontStyle: string;
    underline: boolean;
    textAlign: string;
    fill: string;
    fontFamily: string;
    left: number;
    top: number;
    data: any;
  }

  export const Image: {
    fromURL(url: string, callback: (img: any) => void, options?: any): void;
  };
}