import "./index.css";
import * as fabric from "fabric";
import { AlignGuidelines } from "./module/aligning";
import { CenteringGuidelines } from "./module/centering";

const global: any = {};
global.centerLine_horizontal = "";
global.centerLine_vertical = "";
global.alignmentLines_horizontal = "";
global.alignmentLines_vertical = "";

const fabricCanvas = new fabric.Canvas("myCanvas", {
  backgroundColor: "#F5F5F5",
});

const clearGuideline = () => fabricCanvas.clearContext(fabricCanvas.getSelectionContext());

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
  // global.outer = new fabric.Rect({
  //   width: fabricCanvas.getWidth(),
  //   height: fabricCanvas.getHeight(),
  //   top: 20,
  //   left: 20,
  //   stroke: "#ffffff",
  //   evented: false,
  //   fill: "#ececec",
  //   selectable: false,
  // }) as CustomFabricObject;

  // fabricCanvas.add(global.outer);
  // fabricCanvas.renderAll();

  // if (typeof global.outer.center === "function") {
  //   global.outer.center();
  // } else {
  //   console.warn("Method center is not available on fabric.Rect");
  // }

  const genRect = (
    {
      angle,
    }: {
      angle?: number;
    } = { angle: 0 },
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

  const count = 1;
  const rotateCount = 0;
  for (let i = 0; i < count; i++) {
    if (i < rotateCount) {
      fabricCanvas.add(genRect({ angle: Math.floor(Math.random() * 360) }));
    } else {
      fabricCanvas.add(genRect());
    }
  }

  const boxObjects = fabricCanvas.getObjects().filter((obj: CustomFabricObject) => obj.myType === "box");

  if (boxObjects.length > 0) {
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

if (resetButton) {
  resetButton.addEventListener(
    "click",
    function () {
      reset();
    },
    false,
  );
}

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

  if (zoom > 4) zoom = 4;
  if (zoom < 0.2) zoom = 0.2;

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

const guideline = new AlignGuidelines({
  canvas: fabricCanvas,
  pickObjTypes: [{ key: "myType", value: "box" }],
  aligningOptions: {
    lineColor: "red",
    lineWidth: 0.5,
    horizontalOffset: 15,
    verticalOffset: 15,
  },
});
guideline.init();

const centering = new CenteringGuidelines({
  canvas: fabricCanvas,
  horizontalOffset: 15,
  verticalOffset: 15,
  color: "purple",
});
centering.init();
