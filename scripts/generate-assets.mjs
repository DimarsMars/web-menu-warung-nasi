/**
 * Script generate ikon PWA + OG image dari logo.svg
 * Jalankan sekali: node scripts/generate-assets.mjs
 * Hasil: public/icon-192.png, icon-512.png, apple-touch-icon.png, og-image.png
 */
import sharp from "sharp";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const logoPath = resolve(__dirname, "../public/logo.svg");

async function buatIkon(ukuran, namaFile, background = "#2A4B3A") {
  const svgBuffer = readFileSync(logoPath);

  // Logo diperbesar 76% dari kanvas, di tengah, background hijau gelap
  const padding = Math.round(ukuran * 0.12);
  const logoSize = ukuran - padding * 2;

  const svgUkuran = Buffer.from(
    readFileSync(logoPath, "utf8").replace(
      /width="(\d+)" height="(\d+)"/,
      `width="${logoSize}" height="${logoSize}"`
    )
  );

  await sharp({
    create: {
      width: ukuran,
      height: ukuran,
      channels: 4,
      background,
    },
  })
    .composite([{ input: svgUkuran, top: padding, left: padding }])
    .png()
    .toFile(resolve(__dirname, "../public", namaFile));

  console.log(`✅ ${namaFile} (${ukuran}x${ukuran})`);
}

// Kompas SVG untuk OG image
function buatSvgOg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1E382B"/>
        <stop offset="50%" stop-color="#2A4B3A"/>
        <stop offset="100%" stop-color="#3A6B4F"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="1050" cy="80" r="200" fill="#F3CE67" opacity="0.12"/>
    <circle cx="100" cy="580" r="160" fill="#F3CE67" opacity="0.10"/>
    <circle cx="600" cy="315" r="150" fill="#F3CE67" opacity="0.15"/>
    <circle cx="600" cy="315" r="132" fill="#FAF6EC"/>
    <text x="600" y="365" font-size="110" text-anchor="middle">🍚</text>
    <text x="600" y="540" font-size="58" font-weight="800" fill="#FAF6EC" text-anchor="middle" font-family="Arial, sans-serif">Warung Nasi Barokah</text>
    <text x="600" y="590" font-size="30" font-weight="500" fill="#F3CE67" text-anchor="middle" font-family="Arial, sans-serif">Cek Menu Hari Ini · Update Realtime</text>
  </svg>`;
}

async function main() {
  console.log("🎨 Generate ikon PWA & OG image...\n");

  await buatIkon(192, "icon-192.png");
  await buatIkon(512, "icon-512.png");
  await buatIkon(180, "apple-touch-icon.png");

  await sharp(Buffer.from(buatSvgOg()))
    .png()
    .toFile(resolve(__dirname, "../public/og-image.png"));
  console.log("✅ og-image.png (1200x630)");

  console.log("\n🎉 Semua asset selesai dibuat!");
}

main();
