import * as fabric from "fabric";
/**
 * Augments canvas by assigning to `onObjectMove` and `onAfterRender`.
 * This kind of sucks because other code using those methods will stop functioning.
 * Need to fix it by replacing callbacks with pub/sub kind of subscription model.
 * (or maybe use existing fabric.util.fire/observe (if it won't be too slow))
 */
type CenteringGuidelines = {
    canvas: fabric.Canvas;
    horizontalOffset?: number;
    verticalOffset?: number;
    color?: string;
};
declare function initCenteringGuidelines({ canvas, horizontalOffset, verticalOffset, color, }: CenteringGuidelines): void;
export { initCenteringGuidelines };
