export function getDefaultTextBoxProps() {
    return {
        fontFamily: 'Impact',
        fill: 'white',
        stroke: 'black',
        strokeWidth: 2,
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        lockUniScaling: true,
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false,
        hasBorders: false,
        originX: 'left' as const,
        originY: 'top' as const,
        selectable: true,
        evented: true,
    } as const;
} 