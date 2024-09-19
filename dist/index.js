import * as y from "fabric";
const d = (a) => Object.keys(a);
function H({
  canvas: a,
  horizontalOffset: t = 4,
  verticalOffset: e = 4,
  color: n = "purple"
}) {
  if (!a) return;
  let s = a.getWidth(), o = a.getHeight(), i = s / 2, r = o / 2, M = {}, C = {}, g = n, L = 1, x = a.getSelectionContext();
  for (let f = i - t, m = i + t; f <= m; f++)
    M[Math.round(f)] = !0;
  for (let f = r - e, m = r + e; f <= m; f++)
    C[Math.round(f)] = !0;
  function h() {
    u(
      // canvasWidthCenter + 0.5,
      i,
      0,
      i,
      o
    );
  }
  function l() {
    u(0, r, s, r);
  }
  function u(f, m, p, T) {
    const v = a.viewportTransform, W = y.util.transformPoint(new y.Point(f, m), v), z = y.util.transformPoint(new y.Point(p, T), v);
    x.save(), x.strokeStyle = g, x.lineWidth = L, x.beginPath(), x.moveTo(W.x, W.y), x.lineTo(z.x, z.y), x.stroke(), x.restore();
  }
  let c = null, w = null;
  a.on("mouse:down", () => {
    c = null, w = null, a.viewportTransform;
  }), a.on("object:moving", function(f) {
    let m = f.target, p = m.getCenterPoint();
    a._currentTransform && (c = Math.round(p.x) in M, w = Math.round(p.y) in C, (w || c) && m.setPositionByOrigin(
      new y.Point(
        c ? i : p.x,
        w ? r : p.y
      ),
      "center",
      "center"
    ));
  }), a.on("before:render", function() {
    a.clearContext(a.contextTop);
  }), a.on("object:modified", function() {
    c = null, w = null, a.clearContext(a.contextTop), a.renderAll();
  }), a.on("after:render", () => {
    c && h(), w && l();
  }), a.on("mouse:up", function() {
    a.renderAll();
  });
}
class b {
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
  activeObj = new y.Object();
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
    const o = this.ctx, i = y.util.transformPoint(new y.Point(t, e), this.canvas.viewportTransform), r = y.util.transformPoint(new y.Point(n, s), this.canvas.viewportTransform);
    o.save(), o.lineWidth = this.aligningLineWidth, o.strokeStyle = this.aligningLineColor, o.beginPath(), o.moveTo(i.x, i.y), o.lineTo(r.x, r.y), o.stroke(), this.drawSign(i.x, i.y), this.drawSign(r.x, r.y), o.restore();
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
    d(e).some((n) => Math.abs(e[n].x - t.x) < 1e-4) && this.drawLine(t.x, Math.min(t.y1, t.y2), t.x, Math.max(t.y1, t.y2));
  }
  drawHorizontalLine(t) {
    const e = this.getObjDraggingObjCoords(this.activeObj);
    d(e).some((n) => Math.abs(e[n].y - t.y) < 1e-4) && this.drawLine(Math.min(t.x1, t.x2), t.y, Math.max(t.x1, t.x2), t.y);
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
      const n = this.canvas.getObjects().filter((o) => this.ignoreObjTypes.length ? !this.ignoreObjTypes.some((i) => o[i.key] === i.value) : this.pickObjTypes.length ? this.pickObjTypes.some((i) => o[i.key] === i.value) : !0);
      this.canvas._currentTransform && this.traversAllObjects(e, n);
    });
  }
  getObjDraggingObjCoords(t) {
    const e = t.aCoords, n = new y.Point((e.tl.x + e.br.x) / 2, (e.tl.y + e.br.y) / 2), s = n.x - t.getCenterPoint().x, o = n.y - t.getCenterPoint().y;
    return d(e).reduce(
      (i, r) => ({
        ...i,
        [r]: {
          x: e[r].x - s,
          y: e[r].y - o
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
      let s = ["tl", t.tl], o = ["tl", t.tl];
      d(t).forEach((i) => {
        t[i].x < s[1].x && (s = [i, t[i]]), t[i].x > o[1].x && (o = [i, t[i]]);
      }), n = {
        [s[0]]: s[1],
        [o[0]]: o[1],
        c: t.c
      };
    } else {
      let s = ["tl", t.tl], o = ["tl", t.tl];
      d(t).forEach((i) => {
        t[i].y < s[1].y && (s = [i, t[i]]), t[i].y > o[1].y && (o = [i, t[i]]);
      }), n = {
        [s[0]]: s[1],
        [o[0]]: o[1],
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
    return new y.Point((t.tl.x + t.br.x) / 2, (t.tl.y + t.br.y) / 2);
  }
  traversAllObjects(t, e) {
    const n = this.getObjDraggingObjCoords(t), s = [], o = [];
    for (let i = e.length; i--; ) {
      if (e[i] === t) continue;
      const r = {
        ...e[i].aCoords,
        c: e[i].getCenterPoint()
      }, { objHeight: M, objWidth: C } = this.getObjMaxWidthHeightByCoords(r);
      d(n).forEach((g) => {
        const L = e[i].angle !== 0 ? this.omitCoords(r, "horizontal") : r;
        function x(h, l) {
          let u, c;
          return h === "c" ? (u = Math.min(r.c.x - C / 2, l[g].x), c = Math.max(r.c.x + C / 2, l[g].x)) : (u = Math.min(r[h].x, l[g].x), c = Math.max(r[h].x, l[g].x)), { x1: u, x2: c };
        }
        d(L).forEach((h) => {
          if (this.isInRange(n[g].y, r[h].y)) {
            const l = r[h].y;
            let { x1: u, x2: c } = x(h, n);
            const w = n[g].y - l;
            if (o.push(n.c.y - w), t.aCoords) {
              let { x1: f, x2: m } = x(
                h,
                {
                  ...t.aCoords,
                  c: this.calcCenterPointByACoords(t.aCoords)
                }
              );
              this.horizontalLines.push({ y: l, x1: f, x2: m });
            } else
              this.horizontalLines.push({ y: l, x1: u, x2: c });
          }
        });
      }), d(n).forEach((g) => {
        const L = e[i].angle !== 0 ? this.omitCoords(r, "vertical") : r;
        function x(h, l) {
          let u, c;
          return h === "c" ? (u = Math.min(L.c.y - M / 2, l[g].y), c = Math.max(L.c.y + M / 2, l[g].y)) : (u = Math.min(r[h].y, l[g].y), c = Math.max(r[h].y, l[g].y)), { y1: u, y2: c };
        }
        d(L).forEach((h) => {
          if (this.isInRange(n[g].x, r[h].x)) {
            const l = r[h].x;
            let { y1: u, y2: c } = x(h, n);
            const w = n[g].x - l;
            if (s.push(n.c.x - w), t.aCoords) {
              let { y1: f, y2: m } = x(
                h,
                {
                  ...t.aCoords,
                  c: this.calcCenterPointByACoords(t.aCoords)
                }
              );
              this.verticalLines.push({ x: l, y1: f, y2: m });
            } else
              this.verticalLines.push({ x: l, y1: u, y2: c });
          }
        });
      }), this.snap({
        activeObject: t,
        draggingObjCoords: n,
        snapXPoints: s,
        snapYPoints: o
      });
    }
  }
  snap({
    activeObject: t,
    snapXPoints: e,
    draggingObjCoords: n,
    snapYPoints: s
  }) {
    const o = (i, r) => i.length ? i.map((M) => ({
      abs: Math.abs(r - M),
      val: M
    })).sort((M, C) => M.abs - C.abs)[0].val : r;
    t.setPositionByOrigin(
      // auto snap nearest object, record all the snap points, and then find the nearest one
      new y.Point(o(e, n.c.x), o(s, n.c.y)),
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
    this.watchObjectMoving(), this.watchRender(), this.watchMouseDown(), this.watchMouseUp(), this.watchMouseWheel(), this.centerObjectInCanvas(), H({
      canvas: this.canvas,
      horizontalOffset: this.horizontalOffset,
      verticalOffset: this.verticalOffset,
      color: this.aligningLineColor
    });
  }
}
export {
  b as AlignGuidelines
};
