import sharp from 'sharp';
import { mkdirSync } from 'fs';

const src = 'public/logo.png';
const outDir = 'public/icons';
mkdirSync(outDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  await sharp(src)
    .resize(size, size)
    .png()
    .toFile(`${outDir}/icon-${size}x${size}.png`);
  console.log(`Generated icon-${size}x${size}.png`);
}

// Generate apple-touch-icon
await sharp(src).resize(180, 180).png().toFile('public/apple-touch-icon.png');
console.log('Generated apple-touch-icon.png');

// Generate favicon sizes
await sharp(src).resize(32, 32).png().toFile('public/favicon-32x32.png');
await sharp(src).resize(16, 16).png().toFile('public/favicon-16x16.png');
console.log('Generated favicon PNGs');

// Generate favicon.ico (use 32x32 png as ico)
await sharp(src).resize(48, 48).png().toFile('app/favicon.ico');
console.log('Generated app/favicon.ico');

console.log('Done!');
