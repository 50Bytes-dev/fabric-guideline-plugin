import * as fabric from "fabric";
type CenteringGuidelines = {
    canvas: fabric.Canvas;
    horizontalOffset?: number;
    verticalOffset?: number;
    color?: string;
};
declare function initCenteringGuidelines({ canvas, horizontalOffset, verticalOffset, color, }: CenteringGuidelines): void;
export { initCenteringGuidelines };
