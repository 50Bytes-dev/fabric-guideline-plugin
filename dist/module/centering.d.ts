import * as fabric from "fabric";
export declare class CenteringGuidelines {
    private canvas;
    private horizontalOffset;
    private verticalOffset;
    private color;
    private canvasWidthCenterMap;
    private canvasHeightCenterMap;
    private centerLineWidth;
    private ctx;
    private isInVerticalCenter;
    private isInHorizontalCenter;
    constructor({ canvas, horizontalOffset, verticalOffset, color, }: {
        canvas: fabric.Canvas;
        horizontalOffset?: number;
        verticalOffset?: number;
        color?: string;
    });
    private get canvasWidth();
    private get canvasHeight();
    private get canvasWidthCenter();
    private get canvasHeightCenter();
    private get centerLineColor();
    private showCenterLine;
    private showHorizontalCenterLine;
    private showVerticalCenterLine;
    calculateCanvasCenter(): void;
    init(): void;
}
