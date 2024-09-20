import * as fabric from "fabric";

export class CenteringGuidelines {
    private canvas: fabric.Canvas;
    private horizontalOffset: number;
    private verticalOffset: number;
    private color: string;

    private canvasWidthCenterMap: any = {};
    private canvasHeightCenterMap: any = {};
    private centerLineWidth = 1;

    private ctx: CanvasRenderingContext2D;

    private isInVerticalCenter: boolean | null = null;
    private isInHorizontalCenter: boolean | null = null;

    constructor({
        canvas,
        horizontalOffset = 4,
        verticalOffset = 4,
        color = "purple",
    }: {
        canvas: fabric.Canvas;
        horizontalOffset?: number;
        verticalOffset?: number;
        color?: string;
    }) {
        this.canvas = canvas;
        this.ctx = canvas.getSelectionContext();
        this.horizontalOffset = horizontalOffset;
        this.verticalOffset = verticalOffset;
        this.color = color;
    }

    private get canvasWidth() {
        return this.canvas.getWidth();
    }

    private get canvasHeight() {
        return this.canvas.getHeight();
    }

    private get canvasWidthCenter() {
        return this.canvasWidth / 2;
    }

    private get canvasHeightCenter() {
        return this.canvasHeight / 2;
    }

    private get centerLineColor() {
        return this.color;
    }

    private showCenterLine(x1: number, y1: number, x2: number, y2: number) {
        const transform = this.canvas.viewportTransform as fabric.TMat2D;

        const originXY = new fabric.Point(x1, y1).transform(transform);
        const dimensions = new fabric.Point(x2, y2).transform(transform);

        this.ctx.save();
        this.ctx.strokeStyle = this.centerLineColor;
        this.ctx.lineWidth = this.centerLineWidth;
        this.ctx.beginPath();

        this.ctx.moveTo(originXY.x, originXY.y);
        this.ctx.lineTo(dimensions.x, dimensions.y);
        this.ctx.stroke();
        this.ctx.restore();
    }

    private showHorizontalCenterLine() {
        this.showCenterLine(
            0,
            this.canvasHeightCenter,
            this.canvasWidth,
            this.canvasHeightCenter
        );
    }

    private showVerticalCenterLine() {
        this.showCenterLine(
            this.canvasWidthCenter,
            0,
            this.canvasWidthCenter,
            this.canvasHeight
        );
    }

    private onMouseDown() {
        this.isInVerticalCenter = null;
        this.isInHorizontalCenter = null;
        // this.#centerLine_horizontal = "";
        // this.#centerLine_vertical = "";
        // this.#viewportTransform = this.#canvas.viewportTransform as fabric.TMat2D;
    }

    calculateCanvasCenter() {
        this.canvasWidthCenterMap = {};
        for (let i = this.canvasWidthCenter - this.horizontalOffset, len = this.canvasWidthCenter + this.horizontalOffset; i <= len; i++) {
            this.canvasWidthCenterMap[Math.round(i)] = true;
        }
        this.canvasHeightCenterMap = {};
        for (let i = this.canvasHeightCenter - this.verticalOffset, len = this.canvasHeightCenter + this.verticalOffset; i <= len; i++) {
            this.canvasHeightCenterMap[Math.round(i)] = true;
        }
    }

    init() {
        this.calculateCanvasCenter();

        this.canvas.on("mouse:down", this.onMouseDown.bind(this));

        this.canvas.on("object:moving", (e) => {
            const object = e.target;
            const objectCenter = object.getCenterPoint();
            const transform = this.canvas._currentTransform;

            if (!transform) return;

            this.isInVerticalCenter = Math.round(objectCenter.x) in this.canvasWidthCenterMap;
            this.isInHorizontalCenter = Math.round(objectCenter.y) in this.canvasHeightCenterMap;

            if (this.isInHorizontalCenter || this.isInVerticalCenter) {
                object.setPositionByOrigin(
                    new fabric.Point(
                        this.isInVerticalCenter ? this.canvasWidthCenter : objectCenter.x,
                        this.isInHorizontalCenter ? this.canvasHeightCenter : objectCenter.y
                    ),
                    "center",
                    "center"
                );
            }
        });

        this.canvas.on("before:render", () => {
            this.canvas.clearContext(this.canvas.contextTop);
        });

        this.canvas.on("object:modified", () => {
            this.isInVerticalCenter = null;
            this.isInHorizontalCenter = null;
            this.canvas.clearContext(this.canvas.contextTop);
            this.canvas.renderAll();
        });

        this.canvas.on("after:render", () => {
            if (this.isInVerticalCenter) {
                this.showVerticalCenterLine();
                // this.#centerLine_horizontal = "";
                // this.#centerLine_vertical =
                //     this.#canvasWidthCenter + 0.5 + ", " + 0 + ", " + (this.#canvasWidthCenter + 0.5) + ", " + this.#canvasHeight;
            }

            if (this.isInHorizontalCenter) {
                this.showHorizontalCenterLine();
            }
        });

        this.canvas.on("mouse:up", () => {
            this.canvas.renderAll();
        });
    }
}
