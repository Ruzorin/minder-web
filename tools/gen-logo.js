/* Minder karo logosunun tüm versiyonlarını üretir.
   Çalıştırma: node tools/gen-logo.js
   Kaynak: aşağıdaki SVG tanımları (gemini-svg.svg ile aynı karo)

   Web (şeffaf arka plan):
     assets/img/logo.svg            — vektör, header için
     assets/img/logo.png            — 512x512 şeffaf
     assets/img/favicon-32.png      — 32x32 şeffaf (tarayıcı sekmesi)
     assets/img/splash.png          — 2048x2048 şeffaf splash logosu
   App (koyu zemin):
     assets/img/splash-dark.png     — 2048x2048 koyu (#0a0e1a) splash görseli
     assets/img/logo-app.svg        — vektör, yuvarlak zeminli (#181328)
     assets/img/logo-app-round.png  — 512x512 yuvarlak zemin, köşeler şeffaf
     assets/img/apple-touch-icon.png— 180x180 kare zemin (iOS köşeleri kendisi yuvarlar)
     assets/img/favicon-192.png     — 192x192 kare zemin (Android/PWA)
     assets/img/app-icon-512.png    — 512x512 kare zemin (Google Play)
     assets/img/app-icon-1024.png   — 1024x1024 kare zemin (App Store) */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const OUT = path.join(__dirname, "..", "assets", "img");
const PURPLE = "#9A7BFF";
const BG = "#181328";
const SPLASH_BG = "#0a0e1a";

const defs =
  `<defs><filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">` +
  `<feGaussianBlur stdDeviation="2.5" result="blur"/>` +
  `<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>` +
  `</filter></defs>`;

// glow=false: küçük boyutlar (favicon) için parlamasız, daha kalın ve net çizgi
const diamondOf = (glow = true) => {
  const f = glow ? ' filter="url(#neonGlow)"' : "";
  const sw = glow ? 4 : 6;
  return `<rect x="30" y="30" width="40" height="40" fill="none" stroke="${PURPLE}" stroke-width="${sw}" transform="rotate(45 50 50)"${f}/>` +
    `<rect x="40" y="40" width="20" height="20" fill="${PURPLE}" transform="rotate(45 50 50)"${f}/>`;
};

const svg = (viewBox, bg, glow = true) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="1024" height="1024">${defs}${bg}${diamondOf(glow)}</svg>`;

// Web: şeffaf, karo kadraja yakın
const webSvg = svg("10 10 80 80", "");
// Splash: 2048x2048 tuvalde ortalanmış dengeli boşluk
const splashSvg = svg("-25 -25 150 150", "");
const splashDarkSvg = svg("-25 -25 150 150", `<rect x="-25" y="-25" width="150" height="150" fill="${SPLASH_BG}"/>`);
// App: yuvarlak koyu zemin (orijinal sticker)
const roundSvg = svg("0 0 100 100", `<circle cx="50" cy="50" r="50" fill="${BG}"/>`);
// App: kare koyu zemin (store ikonları — platform kendi maskesini uygular)
const squareSvg = svg("0 0 100 100", `<rect width="100" height="100" fill="${BG}"/>`);

async function png(src, size, name, flattenBg = null) {
  let img = sharp(Buffer.from(src), { density: 300 }).resize(size, size);
  if (flattenBg) img = img.flatten({ background: flattenBg }).removeAlpha();
  await img.png().toFile(path.join(OUT, name));
  console.log(`${name}: ${size}x${size}`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "logo.svg"), webSvg.replace(' width="1024" height="1024"', ""), "utf8");
  fs.writeFileSync(path.join(OUT, "logo-app.svg"), roundSvg.replace(' width="1024" height="1024"', ""), "utf8");
  console.log("logo.svg, logo-app.svg");

  await png(webSvg, 512, "logo.png");
  await png(svg("14 14 72 72", "", false), 32, "favicon-32.png");
  await png(splashSvg, 2048, "splash.png");
  await png(splashDarkSvg, 2048, "splash-dark.png", SPLASH_BG);
  await png(roundSvg, 512, "logo-app-round.png");
  await png(squareSvg, 180, "apple-touch-icon.png", BG);
  await png(squareSvg, 192, "favicon-192.png", BG);
  await png(squareSvg, 512, "app-icon-512.png", BG);
  await png(squareSvg, 1024, "app-icon-1024.png", BG);
})();
