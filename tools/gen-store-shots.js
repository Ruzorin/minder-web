/* Google Play ve App Store mağaza görsellerini üretir.
   Çalıştırma: node tools/gen-store-shots.js
   Çıktılar:
     assets/store/google-play/
       screenshots-phone-1080x1920/  (5 adet 1080x1920, 24-bit PNG)
       feature-graphic-1024x500.png  (1024x500, 24-bit PNG)
       app-icon-512x512.png          (512x512, 24-bit PNG)
     assets/store/app-store/
       iphone-6.7-1290x2796/         (5 adet 1290x2796, 24-bit PNG)
       iphone-6.5-1284x2778/         (5 adet 1284x2778, 24-bit PNG)
       app-icon-1024x1024.png        (1024x1024, 24-bit PNG) */
const fs = require("fs");
const http = require("http");
const path = require("path");
const puppeteer = require("puppeteer-core");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const TEMPLATE_FILE = path.join(__dirname, "store-shots", "template.html");
const STORE_DIR = path.join(ROOT, "assets", "store");

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

const SHOTS = [
  { shot: "feed", file: "01-kampus-akisi.png" },
  { shot: "locked", file: "02-kampus-kilidi.png" },
  { shot: "profile", file: "03-gizli-kimlik.png" },
  { shot: "compose", file: "04-ozgurce-paylas.png" },
  { shot: "notifications", file: "05-bildirimler.png" },
];

const TARGETS = [
  {
    dir: path.join(STORE_DIR, "google-play", "screenshots-phone-1080x1920"),
    width: 1080,
    height: 1920,
    platform: "play",
    items: SHOTS,
  },
  {
    dir: path.join(STORE_DIR, "google-play"),
    width: 1024,
    height: 500,
    platform: "play",
    items: [{ shot: "feature", file: "feature-graphic-1024x500.png" }],
  },
  {
    dir: path.join(STORE_DIR, "app-store", "iphone-6.7-1290x2796"),
    width: 1290,
    height: 2796,
    platform: "ios",
    items: SHOTS,
  },
  {
    dir: path.join(STORE_DIR, "app-store", "iphone-6.5-1284x2778"),
    width: 1284,
    height: 2778,
    platform: "ios",
    items: SHOTS,
  },
];

function findBrowser() {
  for (const p of CHROME_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("Chrome veya Edge bulunamadı.");
}

function startStaticServer() {
  const html = fs.readFileSync(TEMPLATE_FILE, "utf8");
  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}/template.html` });
    });
  });
}

async function saveRgbPng(buffer, outPath, width, height) {
  await sharp(buffer)
    .resize(width, height)
    .flatten({ background: "#0a0e1a" })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  return verifyImage(outPath, width, height);
}

async function verifyImage(filePath, expectedW, expectedH) {
  const meta = await sharp(filePath).metadata();
  if (meta.width !== expectedW || meta.height !== expectedH || meta.channels !== 3 || meta.hasAlpha) {
    throw new Error(
      `Beklenmeyen görsel formatı (${path.basename(filePath)}): ${meta.width}x${meta.height}, ch=${meta.channels}, alpha=${meta.hasAlpha}`
    );
  }
  return meta;
}

(async () => {
  const executablePath = findBrowser();
  const { server, baseUrl } = await startStaticServer();
  const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();

    for (const target of TARGETS) {
      fs.mkdirSync(target.dir, { recursive: true });
      await page.setViewport({
        width: target.width,
        height: target.height,
        deviceScaleFactor: 1,
      });

      for (const item of target.items) {
        const url = `${baseUrl}?shot=${item.shot}&platform=${target.platform}`;
        await page.goto(url, { waitUntil: "networkidle0" });
        await page.waitForFunction('document.body.dataset.ready === "1"', { timeout: 15000 });
        await new Promise((r) => setTimeout(r, 120));

        const shotBuf = await page.screenshot({ type: "png" });
        const outPath = path.join(target.dir, item.file);
        const meta = await saveRgbPng(shotBuf, outPath, target.width, target.height);
        console.log(`✓ ${path.relative(ROOT, outPath)} (${meta.width}x${meta.height}, ch=${meta.channels}, alpha=${meta.hasAlpha})`);
      }
    }

    // Mağaza uygulama ikonları (24-bit RGB, alfa kanalsız)
    const gpIcon = path.join(STORE_DIR, "google-play", "app-icon-512x512.png");
    const asIcon = path.join(STORE_DIR, "app-store", "app-icon-1024x1024.png");
    await sharp(path.join(ROOT, "assets", "img", "app-icon-512.png"))
      .flatten({ background: "#181328" })
      .removeAlpha()
      .png({ compressionLevel: 9 })
      .toFile(gpIcon);
    const gpMeta = await verifyImage(gpIcon, 512, 512);
    console.log(`✓ ${path.relative(ROOT, gpIcon)} (${gpMeta.width}x${gpMeta.height}, ch=${gpMeta.channels}, alpha=${gpMeta.hasAlpha})`);

    await sharp(path.join(ROOT, "assets", "img", "app-icon-1024.png"))
      .flatten({ background: "#181328" })
      .removeAlpha()
      .png({ compressionLevel: 9 })
      .toFile(asIcon);
    const asMeta = await verifyImage(asIcon, 1024, 1024);
    console.log(`✓ ${path.relative(ROOT, asIcon)} (${asMeta.width}x${asMeta.height}, ch=${asMeta.channels}, alpha=${asMeta.hasAlpha})`);
  } finally {
    await browser.close();
    server.close();
  }
})();

