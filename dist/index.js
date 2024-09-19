import * as y from "fabric";
const x = (C) => Object.keys(C);
class d {
  aligningLineMargin = 4;
  aligningLineWidth = 0.75;
  aligningLineColor = "#F68066";
  ignoreObjTypes = [];
  pickObjTypes = [];
  canvas;
  ctx;
  viewportTransform;
  verticalLines = [];
  horizontalLines = [];
  activeObj = new y.Object();
  constructor({
    canvas: t,
    aligningOptions: n,
    ignoreObjTypes: i,
    pickObjTypes: s
  }) {
    this.canvas = t, this.ctx = t.getSelectionContext(), this.ignoreObjTypes = i || [], this.pickObjTypes = s || [], n && (this.aligningLineMargin = n.lineMargin || this.aligningLineMargin, this.aligningLineWidth = n.lineWidth || this.aligningLineWidth, this.aligningLineColor = n.lineColor || this.aligningLineColor);
  }
  drawSign(t, n) {
    const i = this.ctx;
    i.lineWidth = 0.5, i.strokeStyle = this.aligningLineColor, i.beginPath();
    const s = 2;
    i.moveTo(t - s, n - s), i.lineTo(t + s, n + s), i.moveTo(t + s, n - s), i.lineTo(t - s, n + s), i.stroke();
  }
  drawLine(t, n, i, s) {
    const a = this.ctx, e = y.util.transformPoint(new y.Point(t, n), this.canvas.viewportTransform), r = y.util.transformPoint(new y.Point(i, s), this.canvas.viewportTransform);
    a.save(), a.lineWidth = this.aligningLineWidth, a.strokeStyle = this.aligningLineColor, a.beginPath(), a.moveTo(e.x, e.y), a.lineTo(r.x, r.y), a.stroke(), this.drawSign(e.x, e.y), this.drawSign(r.x, r.y), a.restore();
  }
  drawVerticalLine(t) {
    const n = this.getObjDraggingObjCoords(this.activeObj);
    x(n).some((i) => Math.abs(n[i].x - t.x) < 1e-4) && this.drawLine(t.x, Math.min(t.y1, t.y2), t.x, Math.max(t.y1, t.y2));
  }
  drawHorizontalLine(t) {
    const n = this.getObjDraggingObjCoords(this.activeObj);
    x(n).some((i) => Math.abs(n[i].y - t.y) < 1e-4) && this.drawLine(Math.min(t.x1, t.x2), t.y, Math.max(t.x1, t.x2), t.y);
  }
  isInRange(t, n) {
    return Math.abs(Math.round(t) - Math.round(n)) <= this.aligningLineMargin / this.canvas.getZoom();
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
      const n = t.target;
      this.activeObj = n;
      const i = this.canvas.getObjects().filter((a) => this.ignoreObjTypes.length ? !this.ignoreObjTypes.some((e) => a[e.key] === e.value) : this.pickObjTypes.length ? this.pickObjTypes.some((e) => a[e.key] === e.value) : !0);
      this.canvas._currentTransform && this.traversAllObjects(n, i);
    });
  }
  getObjDraggingObjCoords(t) {
    const n = t.aCoords, i = new y.Point((n.tl.x + n.br.x) / 2, (n.tl.y + n.br.y) / 2), s = i.x - t.getCenterPoint().x, a = i.y - t.getCenterPoint().y;
    return x(n).reduce(
      (e, r) => ({
        ...e,
        [r]: {
          x: n[r].x - s,
          y: n[r].y - a
        }
      }),
      {
        c: t.getCenterPoint()
      }
    );
  }
  // 当对象被旋转时，需要忽略一些坐标，例如水平辅助线只取最上、下边的坐标（参考 figma）
  omitCoords(t, n) {
    let i;
    if (n === "vertical") {
      let s = ["tl", t.tl], a = ["tl", t.tl];
      x(t).forEach((e) => {
        t[e].x < s[1].x && (s = [e, t[e]]), t[e].x > a[1].x && (a = [e, t[e]]);
      }), i = {
        [s[0]]: s[1],
        [a[0]]: a[1],
        c: t.c
      };
    } else {
      let s = ["tl", t.tl], a = ["tl", t.tl];
      x(t).forEach((e) => {
        t[e].y < s[1].y && (s = [e, t[e]]), t[e].y > a[1].y && (a = [e, t[e]]);
      }), i = {
        [s[0]]: s[1],
        [a[0]]: a[1],
        c: t.c
      };
    }
    return i;
  }
  getObjMaxWidthHeightByCoords(t) {
    const n = Math.max(Math.abs(t.c.y - t.tl.y), Math.abs(t.c.y - t.tr.y)) * 2, i = Math.max(Math.abs(t.c.x - t.tl.x), Math.abs(t.c.x - t.tr.x)) * 2;
    return { objHeight: n, objWidth: i };
  }
  /**
   * fabric.Object.getCenterPoint will return the center point of the object calc by mouse moving & dragging distance.
   * calcCenterPointByACoords will return real center point of the object position.
   */
  calcCenterPointByACoords(t) {
    return new y.Point((t.tl.x + t.br.x) / 2, (t.tl.y + t.br.y) / 2);
  }
  traversAllObjects(t, n) {
    const i = this.getObjDraggingObjCoords(t), s = [], a = [];
    for (let e = n.length; e--; ) {
      if (n[e] === t) continue;
      const r = {
        ...n[e].aCoords,
        c: n[e].getCenterPoint()
      }, { objHeight: f, objWidth: m } = this.getObjMaxWidthHeightByCoords(r);
      x(i).forEach((o) => {
        const u = n[e].angle !== 0 ? this.omitCoords(r, "horizontal") : r;
        function M(h, l) {
          let c, g;
          return h === "c" ? (c = Math.min(r.c.x - m / 2, l[o].x), g = Math.max(r.c.x + m / 2, l[o].x)) : (c = Math.min(r[h].x, l[o].x), g = Math.max(r[h].x, l[o].x)), { x1: c, x2: g };
        }
        x(u).forEach((h) => {
          if (this.isInRange(i[o].y, r[h].y)) {
            const l = r[h].y;
            let { x1: c, x2: g } = M(h, i);
            const L = i[o].y - l;
            if (a.push(i.c.y - L), t.aCoords) {
              let { x1: w, x2: p } = M(
                h,
                {
                  ...t.aCoords,
                  c: this.calcCenterPointByACoords(t.aCoords)
                }
              );
              this.horizontalLines.push({ y: l, x1: w, x2: p });
            } else
              this.horizontalLines.push({ y: l, x1: c, x2: g });
          }
        });
      }), x(i).forEach((o) => {
        const u = n[e].angle !== 0 ? this.omitCoords(r, "vertical") : r;
        function M(h, l) {
          let c, g;
          return h === "c" ? (c = Math.min(u.c.y - f / 2, l[o].y), g = Math.max(u.c.y + f / 2, l[o].y)) : (c = Math.min(r[h].y, l[o].y), g = Math.max(r[h].y, l[o].y)), { y1: c, y2: g };
        }
        x(u).forEach((h) => {
          if (this.isInRange(i[o].x, r[h].x)) {
            const l = r[h].x;
            let { y1: c, y2: g } = M(h, i);
            const L = i[o].x - l;
            if (s.push(i.c.x - L), t.aCoords) {
              let { y1: w, y2: p } = M(
                h,
                {
                  ...t.aCoords,
                  c: this.calcCenterPointByACoords(t.aCoords)
                }
              );
              this.verticalLines.push({ x: l, y1: w, y2: p });
            } else
              this.verticalLines.push({ x: l, y1: c, y2: g });
          }
        });
      }), this.snap({
        activeObject: t,
        draggingObjCoords: i,
        snapXPoints: s,
        snapYPoints: a
      });
    }
  }
  snap({
    activeObject: t,
    snapXPoints: n,
    draggingObjCoords: i,
    snapYPoints: s
  }) {
    const a = (e, r) => e.length ? e.map((f) => ({
      abs: Math.abs(r - f),
      val: f
    })).sort((f, m) => f.abs - m.abs)[0].val : r;
    t.setPositionByOrigin(
      // auto snap nearest object, record all the snap points, and then find the nearest one
      new y.Point(a(n, i.c.x), a(s, i.c.y)),
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
    this.watchObjectMoving(), this.watchRender(), this.watchMouseDown(), this.watchMouseUp(), this.watchMouseWheel();
  }
}
export {
  d as AlignGuidelines
};
