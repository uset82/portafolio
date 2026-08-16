// Line glyphs drawn to canvas, used as node icon textures.
// Ivory/gold strokes on transparent ground — no colourful app icons.

const S = 128;

const GLYPHS = {
  constellation(c) {
    const pts = [[28, 84], [46, 58], [70, 70], [92, 44], [58, 34], [40, 46]];
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.stroke();
    c.beginPath();
    c.moveTo(70, 70); c.lineTo(74, 96); c.stroke();
    [...pts, [74, 96]].forEach(([x, y]) => {
      c.beginPath(); c.arc(x, y, 3.4, 0, Math.PI * 2); c.fill();
    });
  },
  pyramid(c) {
    c.beginPath(); c.arc(64, 64, 40, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(64, 34); c.lineTo(88, 88); c.lineTo(40, 88); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(52, 68); c.lineTo(76, 68); c.stroke();
  },
  bolt(c) {
    c.beginPath();
    c.moveTo(74, 24); c.lineTo(44, 70); c.lineTo(62, 70); c.lineTo(54, 104);
    c.lineTo(86, 58); c.lineTo(68, 58); c.closePath();
    c.stroke();
  },
  waveform(c) {
    const h = [22, 44, 64, 38, 54, 26];
    h.forEach((v, i) => {
      const x = 26 + i * 15;
      c.beginPath(); c.moveTo(x, 64 - v / 2); c.lineTo(x, 64 + v / 2); c.stroke();
    });
  },
  robot(c) {
    c.beginPath(); c.moveTo(64, 22); c.lineTo(64, 36); c.stroke();
    roundRect(c, 30, 36, 68, 56, 14); c.stroke();
    c.beginPath(); c.arc(50, 62, 5, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(78, 62, 5, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(50, 78); c.lineTo(78, 78); c.stroke();
  },
  code(c) {
    c.beginPath(); c.moveTo(50, 40); c.lineTo(30, 64); c.lineTo(50, 88); c.stroke();
    c.beginPath(); c.moveTo(78, 40); c.lineTo(98, 64); c.lineTo(78, 88); c.stroke();
    c.beginPath(); c.moveTo(70, 34); c.lineTo(58, 94); c.stroke();
  },
  cube(c) {
    c.beginPath();
    c.moveTo(64, 26); c.lineTo(98, 46); c.lineTo(98, 84); c.lineTo(64, 104);
    c.lineTo(30, 84); c.lineTo(30, 46); c.closePath(); c.stroke();
    c.beginPath();
    c.moveTo(30, 46); c.lineTo(64, 66); c.lineTo(98, 46); c.stroke();
    c.beginPath(); c.moveTo(64, 66); c.lineTo(64, 104); c.stroke();
  },
  pin(c) {
    c.beginPath(); c.arc(64, 64, 40, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(64, 54, 12, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(64, 92, 24, Math.PI * 1.18, Math.PI * 1.82); c.stroke();
  },
  mic(c) {
    roundRect(c, 52, 24, 24, 46, 12); c.stroke();
    c.beginPath(); c.arc(64, 66, 24, 0, Math.PI); c.stroke();
    c.beginPath(); c.moveTo(64, 90); c.lineTo(64, 104); c.stroke();
    c.beginPath(); c.moveTo(48, 104); c.lineTo(80, 104); c.stroke();
  },
  chat(c) {
    roundRect(c, 24, 34, 80, 54, 16); c.stroke();
    c.beginPath(); c.moveTo(46, 88); c.lineTo(42, 104); c.lineTo(62, 88); c.stroke();
    [46, 64, 82].forEach((x) => {
      c.beginPath(); c.arc(x, 60, 4, 0, Math.PI * 2); c.fill();
    });
  },
};

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

export function iconCanvas(key, color = "#f4e3c6") {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = S;
  const c = canvas.getContext("2d");
  c.strokeStyle = color;
  c.fillStyle = color;
  c.lineWidth = 5.5;
  c.lineJoin = "round";
  c.lineCap = "round";
  (GLYPHS[key] || GLYPHS.cube)(c);
  return canvas;
}
