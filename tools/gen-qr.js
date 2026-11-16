/* Ortası Minder karo logolu, gerçek (taranabilir) QR kodu üretir.
   Çalıştırma:  node tools/gen-qr.js
   Çıktı:       assets/img/qr-code.svg

   QR, sitenin ana sayfasını açar. Cihaza göre yönlendirmeyi script.js yapar:
     - iPhone / iPad (iOS)  -> App Store
     - Android              -> Google Play
     - Bilgisayar           -> site (masaüstü vitrini)
   Ortadaki logo için en yüksek hata düzeltme seviyesi (H, ~%30) kullanılır. */
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const URL = "https://minder.university";
const MODULE = 10;      // bir modülün piksel boyu
const MARGIN = 4;       // quiet zone (modül)
const DARK = "#0a0e1a";
const EYE = "#5b3fd6";  // köşe gözlerinin iç karesi (marka moru)
const LOGO_RATIO = 0.24; // logonun QR genişliğine oranı

const qr = QRCode.create(URL, { errorCorrectionLevel: "H" });
const N = qr.modules.size;
const DIM = (N + MARGIN * 2) * MODULE;
const center = DIM / 2;

// Logo alanı (modül cinsinden temizlenecek daire)
const logoSize = N * MODULE * LOGO_RATIO;
// Mesafeyi kare-karo şeklinde (|dx|+|dy|) ölçerek logo çevresini karo biçiminde boşaltırız
const clearRadius = logoSize / 2 + MODULE * 0.9;

const finders = [[0, 0], [0, N - 7], [N - 7, 0]];
const inFinder = (r, c) =>
  finders.some(([br, bc]) => r >= br && r < br + 7 && c >= bc && c < bc + 7);

let rects = "";
for (let r = 0; r < N; r++) {
  for (let c = 0; c < N; c++) {
    if (inFinder(r, c) || !qr.modules.get(r, c)) continue;
    const x = (c + MARGIN) * MODULE;
    const y = (r + MARGIN) * MODULE;
    const dx = x + MODULE / 2 - center;
    const dy = y + MODULE / 2 - center;
    if (Math.abs(dx) + Math.abs(dy) < clearRadius + MODULE * 0.6) continue; // logo alanını (karo) boş bırak
    rects += `<rect x="${x}" y="${y}" width="${MODULE}" height="${MODULE}"/>`;
  }
}

// Köşe gözleri (yuvarlatılmış)
let eyes = "";
for (const [br, bc] of finders) {
  const x = (bc + MARGIN) * MODULE;
  const y = (br + MARGIN) * MODULE;
  const s = 7 * MODULE;
  eyes +=
    `<rect x="${x + MODULE / 2}" y="${y + MODULE / 2}" width="${s - MODULE}" height="${s - MODULE}" rx="${MODULE * 1.6}" fill="none" stroke="${DARK}" stroke-width="${MODULE}"/>` +
    `<rect x="${x + 2 * MODULE}" y="${y + 2 * MODULE}" width="${3 * MODULE}" height="${3 * MODULE}" rx="${MODULE * 0.8}" fill="${EYE}"/>`;
}

// Minder karo logosu — arka plansız (şeffaf), QR'ın beyaz zemini üzerinde.
// Karo, viewBox 0..100'de yaklaşık 10..90 aralığını kaplar; bu yüzden 80 birimlik
// alanı logoSize'a sığdırıyoruz.
const scale = logoSize / 80;
const lx = center - 50 * scale;
const logo =
  `<g transform="translate(${lx} ${lx}) scale(${scale})">` +
  `<rect x="30" y="30" width="40" height="40" fill="none" stroke="#8b68ff" stroke-width="5" transform="rotate(45 50 50)" filter="url(#minderGlow)"/>` +
  `<rect x="40" y="40" width="20" height="20" fill="#8b68ff" transform="rotate(45 50 50)" filter="url(#minderGlow)"/>` +
  `</g>`;

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${DIM} ${DIM}" width="${DIM}" height="${DIM}" role="img" aria-label="Minder QR kodu">` +
  `<defs><filter id="minderGlow" x="-50%" y="-50%" width="200%" height="200%">` +
  `<feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>` +
  `</filter></defs>` +
  `<rect width="${DIM}" height="${DIM}" fill="#ffffff"/>` +
  `<g fill="${DARK}" shape-rendering="crispEdges">${rects}</g>` +
  eyes +
  logo +
  `</svg>`;

const outDir = path.join(__dirname, "..", "assets", "img");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "qr-code.svg"), svg, "utf8");
console.log(`QR oluşturuldu -> assets/img/qr-code.svg (${N}x${N}, H, ${URL})`);
