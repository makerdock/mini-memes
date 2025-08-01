export function getDefaultTextBoxProps() {
    return {
        fontFamily: 'Impact',
        fill: 'white',
        stroke: 'black',
        strokeWidth: 2,
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        hasControls: true,
        hasBorders: true,
        padding: 4,
        originX: 'center' as const,
        originY: 'center' as const,
        selectable: true,
        evented: true,
        borderColor: 'black',
        cornerColor: 'black',
        cornerStyle: 'circle',
        transparentCorners: false,
        textAlign: 'center',
        lockUniScaling: true,
    } as const;
} 