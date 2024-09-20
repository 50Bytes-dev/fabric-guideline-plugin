import * as f from "fabric";
const x = (d) => Object.keys(d);
class L {
  aligningLineMargin = 4;
  aligningLineWidth = 0.75;
  aligningLineColor = "#F68066";
  verticalOffset = 5;
  horizontalOffset = 5;
  ignoreObjTypes = [];
  pickObjTypes = [];
  canvas;
  ctx;
  viewportTransform;
  verticalLines = [];
  horizontalLines = [];
  activeObj = new f.Object();
  constructor({
    canvas: t,
    aligningOptions: e,
    ignoreObjTypes: n,
    pickObjTypes: s
  }) {
    this.canvas = t, this.ctx = t.getSelectionContext(), this.ignoreObjTypes = n || [], this.pickObjTypes = s || [], e && (this.aligningLineMargin = e.lineMargin || this.aligningLineMargin, this.aligningLineWidth = e.lineWidth || this.aligningLineWidth, this.aligningLineColor = e.lineColor || this.aligningLineColor, this.verticalOffset = e.verticalOffset || this.verticalOffset, this.horizontalOffset = e.horizontalOffset || this.horizontalOffset);
  }
  drawSign(t, e) {
    const n = this.ctx;
    n.lineWidth = 0.5, n.strokeStyle = this.aligningLineColor, n.beginPath();
    const s = 2;
    n.moveTo(t - s, e - s), n.lineTo(t + s, e + s), n.moveTo(t + s, e - s), n.lineTo(t - s, e + s), n.stroke();
  }
  drawLine(t, e, n, s) {
    const a = this.ctx, i = f.util.transformPoint(new f.Point(t, e), this.canvas.viewportTransform), r = f.util.transformPoint(new f.Point(n, s), this.canvas.viewportTransform);
    a.save(), a.lineWidth = this.aligningLineWidth, a.strokeStyle = this.aligningLineColor, a.beginPath(), a.moveTo(i.x, i.y), a.lineTo(r.x, r.y), a.stroke(), this.drawSign(i.x, i.y), this.drawSign(r.x, r.y), a.restore();
  }
  centerObjectInCanvas() {
    const t = {
      x: this.canvas.getWidth() / 2,
      y: this.canvas.getHeight() / 2
    }, e = this.activeObj, n = e.getScaledWidth(), s = e.getScaledHeight();
    e.set({
      left: t.x - n / 2,
      top: t.y - s / 2
    }), e.setCoords(), this.canvas.renderAll();
  }
  drawVerticalLine(t) {
    const e = this.getObjDraggingObjCoords(this.activeObj);
    x(e).some((n) => Math.abs(e[n].x - t.x) < 1e-4) && this.drawLine(t.x, Math.min(t.y1, t.y2), t.x, Math.max(t.y1, t.y2));
  }
  drawHorizontalLine(t) {
    const e = this.getObjDraggingObjCoords(this.activeObj);
    x(e).some((n) => Math.abs(e[n].y - t.y) < 1e-4) && this.drawLine(Math.min(t.x1, t.x2), t.y, Math.max(t.x1, t.x2), t.y);
  }
  isInRange(t, e) {
    return Math.abs(Math.round(t) - Math.round(e)) <= this.aligningLineMargin / this.canvas.getZoom();
  }
  watchMouseDown() {
    this.canvas.on("mouse:down", () => {
      this.clearLinesMeta(), this.viewportTransform = this.canvas.viewportTransform;
    });
  }
  watchMouseUp() {
    this.canvas.on("mouse:up", () => {
      this.clearLinesMeta(), this.canvas.renderAll();
    });
  }
  watchMouseWheel() {
    this.canvas.on("mouse:wheel", () => {
      this.clearLinesMeta();
    });
  }
  clearLinesMeta() {
    this.verticalLines.length = this.horizontalLines.length = 0;
  }
  watchObjectMoving() {
    this.canvas.on("object:moving", (t) => {
      this.clearLinesMeta();
      const e = t.target;
      this.activeObj = e;
      const n = this.canvas.getObjects().filter((a) => this.ignoreObjTypes.length ? !this.ignoreObjTypes.some((i) => a[i.key] === i.value) : this.pickObjTypes.length ? this.pickObjTypes.some((i) => a[i.key] === i.value) : !0);
      this.canvas._currentTransform && this.traversAllObjects(e, n);
    });
  }
  getObjDraggingObjCoords(t) {
    const e = t.aCoords, n = new f.Point((e.tl.x + e.br.x) / 2, (e.tl.y + e.br.y) / 2), s = n.x - t.getCenterPoint().x, a = n.y - t.getCenterPoint().y;
    return x(e).reduce(
      (i, r) => ({
        ...i,
        [r]: {
          x: e[r].x - s,
          y: e[r].y - a
        }
      }),
      {
        c: t.getCenterPoint()
      }
    );
  }
  // 当对象被旋转时，需要忽略一些坐标，例如水平辅助线只取最上、下边的坐标（参考 figma）
  omitCoords(t, e) {
    let n;
    if (e === "vertical") {
      let s = ["tl", t.tl], a = ["tl", t.tl];
      x(t).forEach((i) => {
        t[i].x < s[1].x && (s = [i, t[i]]), t[i].x > a[1].x && (a = [i, t[i]]);
      }), n = {
        [s[0]]: s[1],
        [a[0]]: a[1],
        c: t.c
      };
    } else {
      let s = ["tl", t.tl], a = ["tl", t.tl];
      x(t).forEach((i) => {
        t[i].y < s[1].y && (s = [i, t[i]]), t[i].y > a[1].y && (a = [i, t[i]]);
      }), n = {
        [s[0]]: s[1],
        [a[0]]: a[1],
        c: t.c
      };
    }
    return n;
  }
  getObjMaxWidthHeightByCoords(t) {
    const e = Math.max(Math.abs(t.c.y - t.tl.y), Math.abs(t.c.y - t.tr.y)) * 2, n = Math.max(Math.abs(t.c.x - t.tl.x), Math.abs(t.c.x - t.tr.x)) * 2;
    return { objHeight: e, objWidth: n };
  }
  /**
   * fabric.Object.getCenterPoint will return the center point of the object calc by mouse moving & dragging distance.
   * calcCenterPointByACoords will return real center point of the object position.
   */
  calcCenterPointByACoords(t) {
    return new f.Point((t.tl.x + t.br.x) / 2, (t.tl.y + t.br.y) / 2);
  }
  traversAllObjects(t, e) {
    const n = this.getObjDraggingObjCoords(t), s = [], a = [];
    for (let i = e.length; i--; ) {
      if (e[i] === t) continue;
      const r = {
        ...e[i].aCoords,
        c: e[i].getCenterPoint()
      }, { objHeight: v, objWidth: y } = this.getObjMaxWidthHeightByCoords(r);
      x(n).forEach((c) => {
        const C = e[i].angle !== 0 ? this.omitCoords(r, "horizontal") : r;
        function u(h, o) {
          let l, g;
          return h === "c" ? (l = Math.min(r.c.x - y / 2, o[c].x), g = Math.max(r.c.x + y / 2, o[c].x)) : (l = Math.min(r[h].x, o[c].x), g = Math.max(r[h].x, o[c].x)), { x1: l, x2: g };
        }
        x(C).forEach((h) => {
          if (this.isInRange(n[c].y, r[h].y)) {
            const o = r[h].y;
            let { x1: l, x2: g } = u(h, n);
            const M = n[c].y - o;
            if (a.push(n.c.y - M), t.aCoords) {
              let { x1: m, x2: w } = u(
                h,
                {
                  ...t.aCoords,
                  c: this.calcCenterPointByACoords(t.aCoords)
                }
              );
              this.horizontalLines.push({ y: o, x1: m, x2: w });
            } else
              this.horizontalLines.push({ y: o, x1: l, x2: g });
          }
        });
      }), x(n).forEach((c) => {
        const C = e[i].angle !== 0 ? this.omitCoords(r, "vertical") : r;
        function u(h, o) {
          let l, g;
          return h === "c" ? (l = Math.min(C.c.y - v / 2, o[c].y), g = Math.max(C.c.y + v / 2, o[c].y)) : (l = Math.min(r[h].y, o[c].y), g = Math.max(r[h].y, o[c].y)), { y1: l, y2: g };
        }
        x(C).forEach((h) => {
          if (this.isInRange(n[c].x, r[h].x)) {
            const o = r[h].x;
            let { y1: l, y2: g } = u(h, n);
            const M = n[c].x - o;
            if (s.push(n.c.x - M), t.aCoords) {
              let { y1: m, y2: w } = u(
                h,
                {
                  ...t.aCoords,
                  c: this.calcCenterPointByACoords(t.aCoords)
                }
              );
              this.verticalLines.push({ x: o, y1: m, y2: w });
            } else
              this.verticalLines.push({ x: o, y1: l, y2: g });
          }
        });
      }), this.snap({
        activeObject: t,
        draggingObjCoords: n,
        snapXPoints: s,
        snapYPoints: a
      });
    }
  }
  snap({
    activeObject: t,
    snapXPoints: e,
    draggingObjCoords: n,
    snapYPoints: s
  }) {
    const a = (i, r) => i.length ? i.map((v) => ({
      abs: Math.abs(r - v),
      val: v
    })).sort((v, y) => v.abs - y.abs)[0].val : r;
    t.setPositionByOrigin(
      // auto snap nearest object, record all the snap points, and then find the nearest one
      new f.Point(a(e, n.c.x), a(s, n.c.y)),
      "center",
      "center"
    );
  }
  clearGuideline() {
    this.canvas.clearContext(this.ctx);
  }
  watchRender() {
    this.canvas.on("before:render", () => {
      this.clearGuideline();
    }), this.canvas.on("after:render", () => {
      for (let t = this.verticalLines.length; t--; )
        this.drawVerticalLine(this.verticalLines[t]);
      for (let t = this.horizontalLines.length; t--; )
        this.drawHorizontalLine(this.horizontalLines[t]);
      this.canvas.calcOffset();
    });
  }
  init() {
    this.watchObjectMoving(), this.watchRender(), this.watchMouseDown(), this.watchMouseUp(), this.watchMouseWheel(), this.centerObjectInCanvas();
  }
}
class p {
  canvas;
  horizontalOffset;
  verticalOffset;
  color;
  canvasWidthCenterMap = {};
  canvasHeightCenterMap = {};
  centerLineWidth = 1;
  ctx;
  isInVerticalCenter = null;
  isInHorizontalCenter = null;
  constructor({
    canvas: t,
    horizontalOffset: e = 4,
    verticalOffset: n = 4,
    color: s = "purple"
  }) {
    this.canvas = t, this.ctx = t.getSelectionContext(), this.horizontalOffset = e, this.verticalOffset = n, this.color = s;
  }
  get canvasWidth() {
    return this.canvas.getWidth();
  }
  get canvasHeight() {
    return this.canvas.getHeight();
  }
  get canvasWidthCenter() {
    return this.canvasWidth / 2;
  }
  get canvasHeightCenter() {
    return this.canvasHeight / 2;
  }
  get centerLineColor() {
    return this.color;
  }
  showCenterLine(t, e, n, s) {
    const a = this.canvas.viewportTransform, i = new f.Point(t, e).transform(a), r = new f.Point(n, s).transform(a);
    this.ctx.save(), this.ctx.strokeStyle = this.centerLineColor, this.ctx.lineWidth = this.centerLineWidth, this.ctx.beginPath(), this.ctx.moveTo(i.x, i.y), this.ctx.lineTo(r.x, r.y), this.ctx.stroke(), this.ctx.restore();
  }
  showHorizontalCenterLine() {
    this.showCenterLine(
      0,
      this.canvasHeightCenter,
      this.canvasWidth,
      this.canvasHeightCenter
    );
  }
  showVerticalCenterLine() {
    this.showCenterLine(
      this.canvasWidthCenter,
      0,
      this.canvasWidthCenter,
      this.canvasHeight
    );
  }
  calculateCanvasCenter() {
    this.canvasWidthCenterMap = {};
    for (let t = this.canvasWidthCenter - this.horizontalOffset, e = this.canvasWidthCenter + this.horizontalOffset; t <= e; t++)
      this.canvasWidthCenterMap[Math.round(t)] = !0;
    this.canvasHeightCenterMap = {};
    for (let t = this.canvasHeightCenter - this.verticalOffset, e = this.canvasHeightCenter + this.verticalOffset; t <= e; t++)
      this.canvasHeightCenterMap[Math.round(t)] = !0;
  }
  init() {
    this.calculateCanvasCenter(), this.canvas.on("mouse:down", () => {
      this.isInVerticalCenter = null, this.isInHorizontalCenter = null;
    }), this.canvas.on("object:moving", (t) => {
      const e = t.target, n = e.getCenterPoint();
      this.canvas._currentTransform && (this.isInVerticalCenter = Math.round(n.x) in this.canvasWidthCenterMap, this.isInHorizontalCenter = Math.round(n.y) in this.canvasHeightCenterMap, (this.isInHorizontalCenter || this.isInVerticalCenter) && e.setPositionByOrigin(
        new f.Point(
          this.isInVerticalCenter ? this.canvasWidthCenter : n.x,
          this.isInHorizontalCenter ? this.canvasHeightCenter : n.y
        ),
        "center",
        "center"
      ));
    }), this.canvas.on("before:render", () => {
      this.canvas.clearContext(this.canvas.contextTop);
    }), this.canvas.on("object:modified", () => {
      this.isInVerticalCenter = null, this.isInHorizontalCenter = null, this.canvas.clearContext(this.canvas.contextTop), this.canvas.renderAll();
    }), this.canvas.on("after:render", () => {
      this.isInVerticalCenter && this.showVerticalCenterLine(), this.isInHorizontalCenter && this.showHorizontalCenterLine();
    }), this.canvas.on("mouse:up", () => {
      this.canvas.renderAll();
    });
  }
}
export {
  L as AlignGuidelines,
  p as CenteringGuidelines
};
