/* splash.png'den transparan arka planlı logo + favicon üretir.
   Çalıştırma: node tools/gen-logo.js
   Çıktılar:
     public/logo.png            — transparan, header için (büyük)
     public/favicon-32.png      — 32x32 favicon
     public/apple-touch-icon.png— 180x180 Apple touch icon
   Strateji: Koyu mavi arka plana chroma-key (yumuşak alpha) uygula,
   logoyu crop et, çeşitli boyutlara ölçekle. */
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

const SRC = "assets/img/splash.png";
const OUT_DIR = "assets/img";

// Luminans tabanlı maskeleme: koyu (arka plan) -> transparan,
// açık (logo) -> opak. Arka plan gradient olduğu için renk tabanlı
// chroma-key yerine luminans eşiği daha güvenilir.
const LOW = 110;  // luminans <= LOW -> tam transparan (arka plan)
const HIGH = 170; // luminans >= HIGH -> tam opak (logo), arası yumuşak
function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

(async () => {
  const img = await Jimp.read(SRC);
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  console.log("Kaynak:", w + "x" + h);

  // 1) Luminans maskeleme: her piksele alpha uygula
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = Jimp.intToRGBA(img.getPixelColor(x, y));
      const lum = luminance(c.r, c.g, c.b);
      let a;
      if (lum <= LOW) a = 0;
      else if (lum >= HIGH) a = 255;
      else a = Math.round(((lum - LOW) / (HIGH - LOW)) * 255);
      img.setPixelColor(Jimp.rgbaToInt(c.r, c.g, c.b, a), x, y);
    }
  }
  console.log("Luminans maskeleme uygulandı.");

  // 2) Opak piksellerin bounding box'ı
  let minX = w, minY = h, maxX = 0, maxY = 0, found = false;
  img.scan(0, 0, w, h, function (x, y, idx) {
    const a = this.bitmap.data[idx + 3];
    if (a > 20) {
      found = true;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  });
  if (!found) throw new Error("Logo bulunamadı!");
  console.log(`Logo bbox: (${minX},${minY})-(${maxX},${maxY})`);

  // 3) Padding ile crop
  const pad = Math.round((maxX - minX) * 0.08);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const cropped = img.clone().crop(minX, minY, cw, ch);
  console.log("Crop:", cw + "x" + ch);

  // 4) Çıktı klasörü
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 5) Header logo: uzun kenarı 160px, aspect ratio korunmuş
  const LOGO_MAX = 160;
  const scale = LOGO_MAX / Math.max(cw, ch);
  const logoW = Math.round(cw * scale);
  const logoH = Math.round(ch * scale);
  const logo = cropped.clone().resize(logoW, logoH, Jimp.RESIZE_BILINEAR);
  await logo.writeAsync(path.join(OUT_DIR, "logo.png"));
  console.log(`logo.png: ${logoW}x${logoH}`);

  // 6) Favicon 32x32 (kare, ortalanmış)
  await writeSquare(cropped, 32, path.join(OUT_DIR, "favicon-32.png"));
  console.log("favicon-32.png: 32x32");

  // 7) Apple touch icon 180x180 (kare, ortalanmış)
  await writeSquare(cropped, 180, path.join(OUT_DIR, "apple-touch-icon.png"));
  console.log("apple-touch-icon.png: 180x180");

  // 8) Ek: 192x192 (Android/PWA)
  await writeSquare(cropped, 192, path.join(OUT_DIR, "favicon-192.png"));
  console.log("favicon-192.png: 192x192");
})();

// Logoyu kare bir tuvale ortalar (favicon için)
async function writeSquare(src, size, outPath) {
  const canvas = new Jimp(size, size, 0x00000000); // transparan
  const s = Math.round(size * 0.78); // logoyu %78 oranında sığdır
  const resized = src.clone().resize(s, s, Jimp.RESIZE_BILINEAR);
  const x = Math.round((size - s) / 2);
  const y = Math.round((size - s) / 2);
  canvas.composite(resized, x, y);
  await canvas.writeAsync(outPath);
}
