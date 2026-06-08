// 라이프라인 로고 SVG → 앱 아이콘 PNG 생성
const sharp = require('sharp');
const path = require('path');

const A = path.resolve(__dirname, '..', 'assets');
const L = path.resolve(__dirname, '..', 'assets', 'logo');

(async () => {
  await sharp(path.join(L, 'icon.svg'), { density: 320 }).resize(1024, 1024).png().toFile(path.join(A, 'icon.png'));
  await sharp(path.join(L, 'icon.svg'), { density: 320 }).resize(256, 256).png().toFile(path.join(A, 'favicon.png'));
  await sharp(path.join(L, 'foreground.svg'), { density: 320 }).resize(1024, 1024).png().toFile(path.join(A, 'android-icon-foreground.png'));
  await sharp(path.join(L, 'foreground.svg'), { density: 320 }).resize(1024, 1024).png().toFile(path.join(A, 'android-icon-monochrome.png'));
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 10, g: 15, b: 26, alpha: 1 } } })
    .png().toFile(path.join(A, 'android-icon-background.png'));
  console.log('✅ icons generated: icon / favicon / android foreground·monochrome·background');
})();
