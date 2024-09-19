import * as fabric from "fabric";
import { AlignGuidelines } from "./aligning";

const fabricCanvas = new fabric.Canvas("myCanvas", {
  backgroundColor: "#F5F5F5",
});
const clearGuideline = () => fabricCanvas.clearContext(fabricCanvas.getSelectionContext());

const global: any = {};
global.centerLine_horizontal = "";
global.centerLine_vertical = "";
global.alignmentLines_horizontal = "";
global.alignmentLines_vertical = "";

setupObjects();

function generateLightColorRgb() {
  const red = Math.floor(((1 + Math.random()) * 256) / 2);
  const green = Math.floor(((1 + Math.random()) * 256) / 2);
  const blue = Math.floor(((1 + Math.random()) * 256) / 2);
  return "rgb(" + red + ", " + green + ", " + blue + ")";
}

interface CustomFabricObject extends fabric.Object {
  myType?: string;
}

function setupObjects() {
  global.outer = new fabric.Rect({
    width: fabricCanvas.getWidth(),
    height: fabricCanvas.getHeight(),
    top: 20,
    left: 20,
    stroke: "#ffffff",
    evented: false,
    fill: "#ececec",
    selectable: false,
  }) as CustomFabricObject;

  fabricCanvas.add(global.outer);
  fabricCanvas.renderAll();

  if (typeof global.outer.center === "function") {
    global.outer.center();
  } else {
    console.error("Method center is not available on fabric.Rect");
  }

  const genRect = (
    {
      angle,
    }: {
      angle?: number;
    } = { angle: 0 }
  ) => {
    return new fabric.Rect({
      width: Math.floor(Math.random() * 300),
      height: Math.floor(Math.random() * 300),
      top: Math.floor(Math.random() * fabricCanvas.getHeight()),
      left: Math.floor(Math.random() * fabricCanvas.getWidth()),
      fill: generateLightColorRgb(),
      angle: angle,
      myType: "box",
    });
  };

  const count = 5;
  const rotateCount = 1;
  for (let i = 0; i < count; i++) {
    if (i < rotateCount) {
      fabricCanvas.add(genRect({ angle: Math.floor(Math.random() * 360) }));
    } else {
      fabricCanvas.add(genRect());
    }
  }

  const boxObjects = fabricCanvas.getObjects().filter((obj: CustomFabricObject) => obj.myType === "box");

  if (boxObjects.length > 0) {
    // Центрируем все объекты вручную
    const boundingRect = getBoundingRect(boxObjects);
    const canvasWidth = fabricCanvas.getWidth();
    const canvasHeight = fabricCanvas.getHeight();
    const centerX = (canvasWidth - boundingRect.width) / 2;
    const centerY = (canvasHeight - boundingRect.height) / 2;

    boxObjects.forEach((obj) => {
      obj.set({
        left: obj.left + centerX - boundingRect.left,
        top: obj.top + centerY - boundingRect.top,
      });
    });

    fabricCanvas.renderAll();
  }
}

function getBoundingRect(objects: fabric.Object[]) {
  if (objects.length === 0) return { left: 0, top: 0, width: 0, height: 0 };

  const lefts = objects.map((obj) => obj.left || 0);
  const tops = objects.map((obj) => obj.top || 0);
  const rights = objects.map((obj) => (obj.left || 0) + (obj.width || 0));
  const bottoms = objects.map((obj) => (obj.top || 0) + (obj.height || 0));

  const left = Math.min(...lefts);
  const top = Math.min(...tops);
  const right = Math.max(...rights);
  const bottom = Math.max(...bottoms);

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

let resetButton = document.getElementById("reset") as any;

resetButton.addEventListener(
  "click",
  function () {
    reset();
  },
  false
);

function reset() {
  fabricCanvas.remove(...fabricCanvas.getObjects());
  setupObjects();
  fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
}

// ------------------------------------

// ==========================================
// MOUSE INTERACTIONS
// ==========================================

// MOUSEWHEEL ZOOM
fabricCanvas.on("mouse:wheel", (opt) => {
  let delta = 0;

  let deltaY = opt.e.deltaY;

  if (deltaY) {
    delta = deltaY > 0 ? 1 : -1;
  }

  let pointer = fabricCanvas.getPointer(opt.e);
  let zoom = fabricCanvas.getZoom();
  zoom = zoom - delta / 10;

  // Ограничьте масштабирование
  if (zoom > 4) zoom = 4;
  if (zoom < 0.2) zoom = 0.2;

  // Примените масштабирование
  fabricCanvas.zoomToPoint(new fabric.Point(pointer.x, pointer.y), zoom);

  opt.e.preventDefault();
  opt.e.stopPropagation();

  fabricCanvas.renderAll();
  fabricCanvas.calcOffset();
});

/**
 * Augments canvas by assigning to `onObjectMove` and `onAfterRender`.
 * This kind of sucks because other code using those methods will stop functioning.
 * Need to fix it by replacing callbacks with pub/sub kind of subscription model.
 * (or maybe use existing fabric.util.fire/observe (if it won't be too slow))
 */
function initCenteringGuidelines(canvas: fabric.Canvas) {
  let canvasWidth = canvas.getWidth(),
    canvasHeight = canvas.getHeight(),
    canvasWidthCenter = canvasWidth / 2,
    canvasHeightCenter = canvasHeight / 2,
    canvasWidthCenterMap: any = {},
    canvasHeightCenterMap: any = {},
    centerLineMargin = 4,
    centerLineColor = "purple",
    centerLineWidth = 1,
    ctx = canvas.getSelectionContext(),
    viewportTransform: number[] = [1, 0, 0, 1, 0, 0];

  for (let i = canvasWidthCenter - centerLineMargin, len = canvasWidthCenter + centerLineMargin; i <= len; i++) {
    canvasWidthCenterMap[Math.round(i)] = true;
  }
  for (let i = canvasHeightCenter - centerLineMargin, len = canvasHeightCenter + centerLineMargin; i <= len; i++) {
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
    // clear these values, to stop drawing guidelines once mouse is up
    canvas.renderAll();
  });
}

// ===============================================
// OBJECT SNAPPING & ALIGNMENT GUIDELINES
// ===============================================

// ORIGINAL:
// https://github.com/fabricjs/fabric.js/blob/master/lib/aligning_guidelines.js

const guideline = new AlignGuidelines({
  canvas: fabricCanvas,
  pickObjTypes: [{ key: "myType", value: "box" }],
  aligningOptions: {
    lineColor: "#ff8181",
    lineWidth: 0.5,
  },
});
guideline.init();
