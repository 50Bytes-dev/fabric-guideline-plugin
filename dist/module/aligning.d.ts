import * as fabric from "fabric";
type VerticalLineCoords = {
    x: number;
    y1: number;
    y2: number;
};
type HorizontalLineCoords = {
    y: number;
    x1: number;
    x2: number;
};
type IgnoreObjTypes = {
    key: string;
    value: any;
}[];
export declare class AlignGuidelines {
    aligningLineMargin: number;
    aligningLineWidth: number;
    aligningLineColor: string;
    verticalOffset: number;
    horizontalOffset: number;
    ignoreObjTypes: IgnoreObjTypes;
    pickObjTypes: IgnoreObjTypes;
    canvas: fabric.Canvas;
    ctx: CanvasRenderingContext2D;
    viewportTransform: any;
    verticalLines: VerticalLineCoords[];
    horizontalLines: HorizontalLineCoords[];
    activeObj: fabric.Object;
    constructor({ canvas, aligningOptions, ignoreObjTypes, pickObjTypes, }: {
        canvas: fabric.Canvas;
        ignoreObjTypes?: IgnoreObjTypes;
        pickObjTypes?: IgnoreObjTypes;
        aligningOptions?: {
            lineMargin?: number;
            lineWidth?: number;
            lineColor?: string;
            verticalOffset?: number;
            horizontalOffset?: number;
        };
    });
    private drawSign;
    private drawLine;
    private centerObjectInCanvas;
    private drawVerticalLine;
    private drawHorizontalLine;
    private isInRange;
    private watchMouseDown;
    private watchMouseUp;
    private watchMouseWheel;
    private clearLinesMeta;
    private watchObjectMoving;
    private getObjDraggingObjCoords;
    private omitCoords;
    private getObjMaxWidthHeightByCoords;
    /**
     * fabric.Object.getCenterPoint will return the center point of the object calc by mouse moving & dragging distance.
     * calcCenterPointByACoords will return real center point of the object position.
     */
    private calcCenterPointByACoords;
    private traversAllObjects;
    private snap;
    clearGuideline(): void;
    watchRender(): void;
    init(): void;
}
export {};
