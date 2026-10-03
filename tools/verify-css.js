/* Yeni eklenen Tailwind class'larının statik CSS'te bulunduğunu doğrular. */
const fs = require("fs");
const css = fs.readFileSync("assets/css/tailwind.css", "utf8");

const checks = [
  "hover\\:border-minder-accent",      // Google Play rozet hover border
  "hover\\:bg-minder-accent\\/10",     // Google Play rozet hover bg
  "bg-minder-accent2\\/15",            // 'Yayında' pill bg
  "text-minder-accent2",               // 'Yayında' pill text
  "bg-white\\/10",                     // 'Yakında' pill bg
  "text-\\[10px\\]",                   // pill font boyutu
  "py-0\\.5",                          // pill dikey padding
  "px-2",                              // pill yatay padding
];

let missing = 0;
for (const c of checks) {
  const found = css.includes("." + c);
  console.log((found ? "OK   " : "YOK  ") + c);
  if (!found) missing++;
}
console.log(missing === 0 ? "\nTüm class'lar CSS'te mevcut." : `\n${missing} class eksik!`);
process.exit(missing === 0 ? 0 : 1);
