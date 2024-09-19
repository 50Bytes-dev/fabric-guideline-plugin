import * as u from "fabric";
const C = (o) => Object.keys(o), h = new u.Canvas("myCanvas", {
  backgroundColor: "#F5F5F5"
}), w = {};
w.centerLine_horizontal = "";
w.centerLine_vertical = "";
w.alignmentLines_horizontal = "";
w.alignmentLines_vertical = "";
O();
function A() {
  const o = Math.floor((1 + Math.random()) * 256 / 2), t = Math.floor((1 + Math.random()) * 256 / 2), e = Math.floor((1 + Math.random()) * 256 / 2);
  return "rgb(" + o + ", " + t + ", " + e + ")";
}
function O() {
  w.outer = new u.Rect({
    width: h.getWidth(),
    height: h.getHeight(),
    top: 20,
    left: 20,
    stroke: "#ffffff",
    evented: !1,
    fill: "#ececec",
    selectable: !1
  }), h.add(w.outer), h.renderAll(), typeof w.outer.center == "function" ? w.outer.center() : console.error("Method center is not available on fabric.Rect");
  const o = ({
    angle: n
  } = { angle: 0 }) => new u.Rect({
    width: Math.floor(Math.random() * 300),
    height: Math.floor(Math.random() * 300),
    top: Math.floor(Math.random() * h.getHeight()),
    left: Math.floor(Math.random() * h.getWidth()),
    fill: A(),
    angle: n,
    myType: "box"
  }), t = 5, e = 1;
  for (let n = 0; n < t; n++)
    n < e ? h.add(o({ angle: Math.floor(Math.random() * 360) })) : h.add(o());
  const i = h.getObjects().filter((n) => n.myType === "box");
  if (i.length > 0) {
    const n = P(i), s = h.getWidth(), r = h.getHeight(), a = (s - n.width) / 2, m = (r - n.height) / 2;
    i.forEach((l) => {
      l.set({
        left: l.left + a - n.left,
        top: l.top + m - n.top
      });
    }), h.renderAll();
  }
}
function P(o) {
  if (o.length === 0) return { left: 0, top: 0, width: 0, height: 0 };
  const t = o.map((l) => l.left || 0), e = o.map((l) => l.top || 0), i = o.map((l) => (l.left || 0) + (l.width || 0)), n = o.map((l) => (l.top || 0) + (l.height || 0)), s = Math.min(...t), r = Math.min(...e), a = Math.max(...i), m = Math.max(...n);
  return {
    left: s,
    top: r,
    width: a - s,
    height: m - r
  };
}
let R = document.getElementById("reset");
R.addEventListener(
  "click",
  function() {
    B();
  },
  !1
);
function B() {
  h.remove(...h.getObjects()), O(), h.setViewportTransform([1, 0, 0, 1, 0, 0]);
}
h.on("mouse:wheel", (o) => {
  let t = 0, e = o.e.deltaY;
  e && (t = e > 0 ? 1 : -1);
  let i = h.getPointer(o.e), n = h.getZoom();
  n = n - t / 10, n > 4 && (n = 4), n < 0.2 && (n = 0.2), h.zoomToPoint(new u.Point(i.x, i.y), n), o.e.preventDefault(), o.e.stopPropagation(), h.renderAll(), h.calcOffset();
});
function S({
  canvas: o,
  horizontalOffset: t = 4,
  verticalOffset: e = 4,
  color: i = "purple"
}) {
  if (!o) return;
  let n = o.getWidth(), s = o.getHeight(), r = n / 2, a = s / 2, m = {}, l = {}, d = i, v = 1, y = o.getSelectionContext();
  for (let x = r - t, p = r + t; x <= p; x++)
    m[Math.round(x)] = !0;
  for (let x = a - e, p = a + e; x <= p; x++)
    l[Math.round(x)] = !0;
  function c() {
    M(
      // canvasWidthCenter + 0.5,
      r,
      0,
      r,
      s
    );
  }
  function f() {
    M(0, a, n, a);
  }
  function M(x, p, T, W) {
    const b = o.viewportTransform, z = u.util.transformPoint(new u.Point(x, p), b), H = u.util.transformPoint(new u.Point(T, W), b);
    y.save(), y.strokeStyle = d, y.lineWidth = v, y.beginPath(), y.moveTo(z.x, z.y), y.lineTo(H.x, H.y), y.stroke(), y.restore();
  }
  let g = null, L = null;
  o.on("mouse:down", () => {
    g = null, L = null, w.centerLine_horizontal = "", w.centerLine_vertical = "", o.viewportTransform;
  }), o.on("object:moving", function(x) {
    let p = x.target, T = p.getCenterPoint();
    o._currentTransform && (g = Math.round(T.x) in m, L = Math.round(T.y) in l, (L || g) && p.setPositionByOrigin(
      new u.Point(
        g ? r : T.x,
        L ? a : T.y
      ),
      "center",
      "center"
    ));
  }), o.on("before:render", function() {
    o.clearContext(o.contextTop);
  }), o.on("object:modified", function() {
    g = null, L = null, o.clearContext(o.contextTop), o.renderAll();
  }), o.on("after:render", () => {
    g && (c(), w.centerLine_horizontal = "", w.centerLine_vertical = r + 0.5 + ", 0, " + (r + 0.5) + ", " + s), L && f();
  }), o.on("mouse:up", function() {
    o.renderAll();
  });
}
const _ = new E({
  canvas: h,
  pickObjTypes: [{ key: "myType", value: "box" }],
  aligningOptions: {
    lineColor: "red",
    lineWidth: 0.5,
    horizontalOffset: 40,
    verticalOffset: 40
  }
  // centerOptions: {
  //   horizontalOffset: 10,
  //   verticalOffset: 10
  // }
});
_.init();
class E {
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
  activeObj = new u.Object();
  constructor({
    canvas: t,
    aligningOptions: e,
    ignoreObjTypes: i,
    pickObjTypes: n
  }) {
    this.canvas = t, this.ctx = t.getSelectionContext(), this.ignoreObjTypes = i || [], this.pickObjTypes = n || [], e && (this.aligningLineMargin = e.lineMargin || this.aligningLineMargin, this.aligningLineWidth = e.lineWidth || this.aligningLineWidth, this.aligningLineColor = e.lineColor || this.aligningLineColor, this.verticalOffset = e.verticalOffset || this.verticalOffset, this.horizontalOffset = e.horizontalOffset || this.horizontalOffset);
  }
  drawSign(t, e) {
    const i = this.ctx;
    i.lineWidth = 0.5, i.strokeStyle = this.aligningLineColor, i.beginPath();
    const n = 2;
    i.moveTo(t - n, e - n), i.lineTo(t + n, e + n), i.moveTo(t + n, e - n), i.lineTo(t - n, e + n), i.stroke();
  }
  drawLine(t, e, i, n) {
    const s = this.ctx, r = u.util.transformPoint(new u.Point(t, e), this.canvas.viewportTransform), a = u.util.transformPoint(new u.Point(i, n), this.canvas.viewportTransform);
    s.save(), s.lineWidth = this.aligningLineWidth, s.strokeStyle = this.aligningLineColor, s.beginPath(), s.moveTo(r.x, r.y), s.lineTo(a.x, a.y), s.stroke(), this.drawSign(r.x, r.y), this.drawSign(a.x, a.y), s.restore();
  }
  centerObjectInCanvas() {
    const t = {
      x: this.canvas.getWidth() / 2,
      y: this.canvas.getHeight() / 2
    }, e = this.activeObj, i = e.getScaledWidth(), n = e.getScaledHeight();
    e.set({
      left: t.x - i / 2,
      top: t.y - n / 2
    }), e.setCoords(), this.canvas.renderAll();
  }
  drawVerticalLine(t) {
    const e = this.getObjDraggingObjCoords(this.activeObj);
    C(e).some((i) => Math.abs(e[i].x - t.x) < 1e-4) && this.drawLine(t.x, Math.min(t.y1, t.y2), t.x, Math.max(t.y1, t.y2));
  }
  drawHorizontalLine(t) {
    const e = this.getObjDraggingObjCoords(this.activeObj);
    C(e).some((i) => Math.abs(e[i].y - t.y) < 1e-4) && this.drawLine(Math.min(t.x1, t.x2), t.y, Math.max(t.x1, t.x2), t.y);
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
      const i = this.canvas.getObjects().filter((s) => this.ignoreObjTypes.length ? !this.ignoreObjTypes.some((r) => s[r.key] === r.value) : this.pickObjTypes.length ? this.pickObjTypes.some((r) => s[r.key] === r.value) : !0);
      this.canvas._currentTransform && this.traversAllObjects(e, i);
    });
  }
  getObjDraggingObjCoords(t) {
    const e = t.aCoords, i = new u.Point((e.tl.x + e.br.x) / 2, (e.tl.y + e.br.y) / 2), n = i.x - t.getCenterPoint().x, s = i.y - t.getCenterPoint().y;
    return C(e).reduce(
      (r, a) => ({
        ...r,
        [a]: {
          x: e[a].x - n,
          y: e[a].y - s
        }
      }),
      {
        c: t.getCenterPoint()
      }
    );
  }
  // 当对象被旋转时，需要忽略一些坐标，例如水平辅助线只取最上、下边的坐标（参考 figma）
  omitCoords(t, e) {
    let i;
    if (e === "vertical") {
      let n = ["tl", t.tl], s = ["tl", t.tl];
      C(t).forEach((r) => {
        t[r].x < n[1].x && (n = [r, t[r]]), t[r].x > s[1].x && (s = [r, t[r]]);
      }), i = {
        [n[0]]: n[1],
        [s[0]]: s[1],
        c: t.c
      };
    } else {
      let n = ["tl", t.tl], s = ["tl", t.tl];
      C(t).forEach((r) => {
        t[r].y < n[1].y && (n = [r, t[r]]), t[r].y > s[1].y && (s = [r, t[r]]);
      }), i = {
        [n[0]]: n[1],
        [s[0]]: s[1],
        c: t.c
      };
    }
    return i;
  }
  getObjMaxWidthHeightByCoords(t) {
    const e = Math.max(Math.abs(t.c.y - t.tl.y), Math.abs(t.c.y - t.tr.y)) * 2, i = Math.max(Math.abs(t.c.x - t.tl.x), Math.abs(t.c.x - t.tr.x)) * 2;
    return { objHeight: e, objWidth: i };
  }
  /**
   * fabric.Object.getCenterPoint will return the center point of the object calc by mouse moving & dragging distance.
   * calcCenterPointByACoords will return real center point of the object position.
   */
  calcCenterPointByACoords(t) {
    return new u.Point((t.tl.x + t.br.x) / 2, (t.tl.y + t.br.y) / 2);
  }
  traversAllObjects(t, e) {
    const i = this.getObjDraggingObjCoords(t), n = [], s = [];
    for (let r = e.length; r--; ) {
      if (e[r] === t) continue;
      const a = {
        ...e[r].aCoords,
        c: e[r].getCenterPoint()
      }, { objHeight: m, objWidth: l } = this.getObjMaxWidthHeightByCoords(a);
      C(i).forEach((d) => {
        const v = e[r].angle !== 0 ? this.omitCoords(a, "horizontal") : a;
        function y(c, f) {
          let M, g;
          return c === "c" ? (M = Math.min(a.c.x - l / 2, f[d].x), g = Math.max(a.c.x + l / 2, f[d].x)) : (M = Math.min(a[c].x, f[d].x), g = Math.max(a[c].x, f[d].x)), { x1: M, x2: g };
        }
        C(v).forEach((c) => {
          if (this.isInRange(i[d].y, a[c].y)) {
            const f = a[c].y;
            let { x1: M, x2: g } = y(c, i);
            const L = i[d].y - f;
            if (s.push(i.c.y - L), t.aCoords) {
              let { x1: x, x2: p } = y(
                c,
                {
                  ...t.aCoords,
                  c: this.calcCenterPointByACoords(t.aCoords)
                }
              );
              this.horizontalLines.push({ y: f, x1: x, x2: p });
            } else
              this.horizontalLines.push({ y: f, x1: M, x2: g });
          }
        });
      }), C(i).forEach((d) => {
        const v = e[r].angle !== 0 ? this.omitCoords(a, "vertical") : a;
        function y(c, f) {
          let M, g;
          return c === "c" ? (M = Math.min(v.c.y - m / 2, f[d].y), g = Math.max(v.c.y + m / 2, f[d].y)) : (M = Math.min(a[c].y, f[d].y), g = Math.max(a[c].y, f[d].y)), { y1: M, y2: g };
        }
        C(v).forEach((c) => {
          if (this.isInRange(i[d].x, a[c].x)) {
            const f = a[c].x;
            let { y1: M, y2: g } = y(c, i);
            const L = i[d].x - f;
            if (n.push(i.c.x - L), t.aCoords) {
              let { y1: x, y2: p } = y(
                c,
                {
                  ...t.aCoords,
                  c: this.calcCenterPointByACoords(t.aCoords)
                }
              );
              this.verticalLines.push({ x: f, y1: x, y2: p });
            } else
              this.verticalLines.push({ x: f, y1: M, y2: g });
          }
        });
      }), this.snap({
        activeObject: t,
        draggingObjCoords: i,
        snapXPoints: n,
        snapYPoints: s
      });
    }
  }
  snap({
    activeObject: t,
    snapXPoints: e,
    draggingObjCoords: i,
    snapYPoints: n
  }) {
    const s = (r, a) => r.length ? r.map((m) => ({
      abs: Math.abs(a - m),
      val: m
    })).sort((m, l) => m.abs - l.abs)[0].val : a;
    t.setPositionByOrigin(
      // auto snap nearest object, record all the snap points, and then find the nearest one
      new u.Point(s(e, i.c.x), s(n, i.c.y)),
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
    this.watchObjectMoving(), this.watchRender(), this.watchMouseDown(), this.watchMouseUp(), this.watchMouseWheel(), this.centerObjectInCanvas(), S({
      canvas: this.canvas,
      horizontalOffset: this.horizontalOffset,
      verticalOffset: this.verticalOffset,
      color: this.aligningLineColor
    });
  }
}
export {
  E as AlignGuidelines
};
