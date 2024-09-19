import * as fabric from "fabric";

const global: any = {};
global.centerLine_horizontal = "";
global.centerLine_vertical = "";
global.alignmentLines_horizontal = "";
global.alignmentLines_vertical = "";

type CenteringGuidelines = {
  canvas: fabric.Canvas;
  horizontalOffset?: number;
  verticalOffset?: number;
  color?: string;
};

function initCenteringGuidelines({
  canvas,
  horizontalOffset = 4,
  verticalOffset = 4,
  color = "purple",
}: CenteringGuidelines) {
  if (!canvas) return;
  let canvasWidth = canvas.getWidth(),
    canvasHeight = canvas.getHeight(),
    canvasWidthCenter = canvasWidth / 2,
    canvasHeightCenter = canvasHeight / 2,
    canvasWidthCenterMap: any = {},
    canvasHeightCenterMap: any = {},
    centerLineMargin = 4,
    centerLineColor = color,
    centerLineWidth = 1,
    ctx = canvas.getSelectionContext(),
    viewportTransform: number[] = [1, 0, 0, 1, 0, 0];

  for (let i = canvasWidthCenter - horizontalOffset, len = canvasWidthCenter + horizontalOffset; i <= len; i++) {
    canvasWidthCenterMap[Math.round(i)] = true;
  }
  for (let i = canvasHeightCenter - verticalOffset, len = canvasHeightCenter + verticalOffset; i <= len; i++) {
    canvasHeightCenterMap[Math.round(i)] = true;
  }

  function showVerticalCenterLine() {
    showCenterLine(
      // canvasWidthCenter + 0.5,
      canvasWidthCenter,
      0,
      canvasWidthCenter,
      canvasHeight
    );
  }

  function showHorizontalCenterLine() {
    showCenterLine(0, canvasHeightCenter, canvasWidth, canvasHeightCenter);
  }

  function showCenterLine(x1: number, y1: number, x2: number, y2: number) {
    const transform = canvas.viewportTransform as fabric.TMat2D;

    const originXY = fabric.util.transformPoint(new fabric.Point(x1, y1), transform);
    const dimensions = fabric.util.transformPoint(new fabric.Point(x2, y2), transform);

    ctx.save();
    ctx.strokeStyle = centerLineColor;
    ctx.lineWidth = centerLineWidth;
    ctx.beginPath();

    ctx.moveTo(originXY.x, originXY.y);
    ctx.lineTo(dimensions.x, dimensions.y);
    ctx.stroke();
    ctx.restore();
  }

  let afterRenderActions: any[] = [];
  let isInVerticalCenter: boolean | null = null;
  let isInHorizontalCenter: boolean | null = null;

  canvas.on("mouse:down", () => {
    isInVerticalCenter = null;
    isInHorizontalCenter = null;
    global.centerLine_horizontal = "";
    global.centerLine_vertical = "";
    viewportTransform = canvas.viewportTransform as fabric.TMat2D;
  });

  canvas.on("object:moving", function (e) {
    let object = e.target,
      objectCenter = object.getCenterPoint(),
      transform = canvas._currentTransform;

    if (!transform) return;

    (isInVerticalCenter = Math.round(objectCenter.x) in canvasWidthCenterMap),
      (isInHorizontalCenter = Math.round(objectCenter.y) in canvasHeightCenterMap);

    if (isInHorizontalCenter || isInVerticalCenter) {
      object.setPositionByOrigin(
        new fabric.Point(
          isInVerticalCenter ? canvasWidthCenter : objectCenter.x,
          isInHorizontalCenter ? canvasHeightCenter : objectCenter.y
        ),
        "center",
        "center"
      );
    }
  });

  canvas.on("before:render", function () {
    canvas.clearContext(canvas.contextTop);
  });

  canvas.on("object:modified", function () {
    isInVerticalCenter = null;
    isInHorizontalCenter = null;
    canvas.clearContext(canvas.contextTop);
    canvas.renderAll();
  });

  canvas.on("after:render", () => {
    if (isInVerticalCenter) {
      showVerticalCenterLine();
      global.centerLine_horizontal = "";
      global.centerLine_vertical =
        canvasWidthCenter + 0.5 + ", " + 0 + ", " + (canvasWidthCenter + 0.5) + ", " + canvasHeight;
    }

    if (isInHorizontalCenter) {
      showHorizontalCenterLine();
    }
  });

  canvas.on("mouse:up", function () {
    canvas.renderAll();
  });
}

export { initCenteringGuidelines };
