/* Dummy (sahte) QR kodu benzeri SVG üretir.
   Çalıştırma:  node tools/gen-qr.js
   Çıktı:       assets/img/qr-code.svg
   Not: Bu gerçek bir QR kodu DEĞİLDİR; yalnızca görsel yer tutucudur. */
const fs = require("fs");
const path = require("path");

const SIZE = 25;        // modül sayısı (kenar)
const MODULE = 8;       // bir modülün piksel boyu
const MARGIN = 4;       // quiet zone (modül)
const DIM = (SIZE + MARGIN * 2) * MODULE;

// Basit deterministik PRNG (her seferinde aynı görüntü)
let seed = 987654321;
function rand() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

const finders = [[0, 0], [0, SIZE - 7], [SIZE - 7, 0]];

function inFinder(r, c) {
  return finders.some(([br, bc]) => r >= br && r < br + 7 && c >= bc && c < bc + 7);
}

function finderFill(r, c) {
  for (const [br, bc] of finders) {
    if (r >= br && r < br + 7 && c >= bc && c < bc + 7) {
      const lr = r - br, lc = c - bc;
      if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true; // dış halka
      if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;     // iç 3x3
      return false;                                                  // beyaz halka
    }
  }
  return false;
}

let rects = "";
for (let r = 0; r < SIZE; r++) {
  for (let c = 0; c < SIZE; c++) {
    let dark;
    if (inFinder(r, c)) {
      dark = finderFill(r, c);
    } else if (r === 6 || c === 6) {
      dark = (r + c) % 2 === 0; // timing pattern
    } else {
      dark = rand() > 0.5;
    }
    if (dark) {
      const x = (c + MARGIN) * MODULE;
      const y = (r + MARGIN) * MODULE;
      rects += `<rect x="${x}" y="${y}" width="${MODULE}" height="${MODULE}"/>`;
    }
  }
}

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${DIM} ${DIM}" width="${DIM}" height="${DIM}" shape-rendering="crispEdges" role="img" aria-label="Minder QR kodu">` +
  `<rect width="${DIM}" height="${DIM}" fill="#ffffff"/>` +
  `<g fill="#0a0e1a">${rects}</g>` +
  `</svg>`;

const outDir = path.join(__dirname, "..", "assets", "img");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "qr-code.svg"), svg, "utf8");
console.log("QR oluşturuldu -> assets/img/qr-code.svg");
