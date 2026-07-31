/* splash.png görselini analiz eder: köşe pikselleri, ortalama renk,
   arka plan rengini tespit eder. Logo işleme stratejisini belirlemek için. */
const Jimp = require("jimp");

(async () => {
  const img = await Jimp.read("assets/img/splash.png");
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  console.log("Boyut:", w + "x" + h);

  // Köşe pikselleri (arka plan rengini tahmin et)
  const corners = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
    [Math.floor(w / 2), 0],
    [0, Math.floor(h / 2)],
  ];
  console.log("\nKöşe pikselleri (R,G,B):");
  corners.forEach(([x, y]) => {
    const c = Jimp.intToRGBA(img.getPixelColor(x, y));
    console.log(`  (${x},${y}): rgb(${c.r},${c.g},${c.b}) a=${c.a}`);
  });

  // Merkez bölge (logonun olabileceği yer)
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);
  console.log("\nMerkez pikseller:");
  for (let i = -2; i <= 2; i++) {
    const c = Jimp.intToRGBA(img.getPixelColor(cx, cy + i * 100));
    console.log(`  merkez+${i * 100}y: rgb(${c.r},${c.g},${c.b}) a=${c.a}`);
  }

  // Arka plan rengi için köşe ortalaması
  let rSum = 0, gSum = 0, bSum = 0;
  corners.forEach(([x, y]) => {
    const c = Jimp.intToRGBA(img.getPixelColor(x, y));
    rSum += c.r; gSum += c.g; bSum += c.b;
  });
  const n = corners.length;
  console.log(`\nArka plan tahmini (köşe ort): rgb(${Math.round(rSum / n)},${Math.round(gSum / n)},${Math.round(bSum / n)})`);
})();
