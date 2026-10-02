/* Tüm HTML dosyalarındaki Tailwind Play CDN script bloğunu
   statik build CSS link'iyle değiştirir (FOUC fix).
   Çalıştırma: node tools/replace-tailwind-cdn.js */
const fs = require("fs");

const files = ["index.html", "privacy.html", "terms.html", "safety.html", "delete-data.html"];

const re = /  <!-- Tailwind CSS \(CDN\) -->\r?\n  <script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\r?\n  <script>\r?\n[\s\S]*?\r?\n  <\/script>\r?\n/;

const replacement =
  "  <!-- Tailwind CSS (statik build — FOUC yok) -->\n" +
  '  <link rel="stylesheet" href="assets/css/tailwind.css" />\n';

let changed = 0;
for (const f of files) {
  if (!fs.existsSync(f)) { console.log("ATLANDI (yok):", f); continue; }
  const src = fs.readFileSync(f, "utf8");
  if (!re.test(src)) { console.log("ATLANDI (blok bulunamadı):", f); continue; }
  fs.writeFileSync(f, src.replace(re, replacement), "utf8");
  console.log("GÜNCELLENDİ:", f);
  changed++;
}
console.log(`\n${changed}/${files.length} dosya güncellendi.`);
