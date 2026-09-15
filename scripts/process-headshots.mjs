import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sourceFiles = [
  'C:\\Users\\custo\\OneDrive\\CLAUDE\\Christina Personal\\Personal Website\\Website Photo References\\Headshot.jpg',
  'C:\\Users\\custo\\OneDrive\\CLAUDE\\Christina Personal\\Personal Website\\Website Photo References\\Headshot 2.jpg'
];

const outputDir = 'public/images/about/headshots';
const LONG_EDGE = 1800;
const THUMB_SIZE = 400;

async function processHeadshots() {
  console.log('Processing headshots...\n');

  const manifest = [];

  for (let idx = 0; idx < sourceFiles.length; idx++) {
    const inputPath = sourceFiles[idx];
    const num = String(idx + 1).padStart(2, '0');
    const basename = `headshot-${num}`;

    try {
      // Read and validate
      const buffer = fs.readFileSync(inputPath);
      const metadata = await sharp(buffer).metadata();

      if (!metadata || !metadata.width || !metadata.height) {
        throw new Error('Invalid image dimensions');
      }

      console.log(`Processing: ${path.basename(inputPath)}`);
      console.log(`  Dimensions: ${metadata.width}x${metadata.height}`);

      // Calculate resize dimensions
      const { width, height } = metadata;
      let resizeWidth = LONG_EDGE;
      let resizeHeight = LONG_EDGE;

      if (width > height) {
        resizeHeight = Math.round((LONG_EDGE / width) * height);
      } else {
        resizeWidth = Math.round((LONG_EDGE / height) * width);
      }

      // WebP
      const webpPath = path.join(outputDir, `${basename}.webp`);
      await sharp(buffer)
        .rotate()
        .resize(resizeWidth, resizeHeight, { fit: 'inside', withoutEnlargement: true })
        .toFormat('webp', { quality: 80 })
        .toFile(webpPath);

      // JPEG
      const jpegPath = path.join(outputDir, `${basename}.jpg`);
      await sharp(buffer)
        .rotate()
        .resize(resizeWidth, resizeHeight, { fit: 'inside', withoutEnlargement: true })
        .toFormat('jpeg', { quality: 82, progressive: true })
        .toFile(jpegPath);

      // Thumbnail
      const thumbPath = path.join(outputDir, `${basename}_thumb.jpg`);
      await sharp(buffer)
        .rotate()
        .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover' })
        .toFormat('jpeg', { quality: 80, progressive: true })
        .toFile(thumbPath);

      console.log(`  ✓ ${basename}.webp (${fs.statSync(webpPath).size} bytes)`);
      console.log(`  ✓ ${basename}.jpg (${fs.statSync(jpegPath).size} bytes)`);
      console.log(`  ✓ ${basename}_thumb.jpg (${fs.statSync(thumbPath).size} bytes)\n`);

      manifest.push({
        basename,
        webp: resizeWidth,
        height: resizeHeight
      });
    } catch (err) {
      console.error(`✗ Failed: ${basename} — ${err.message}\n`);
    }
  }

  // Verify EXIF stripping
  console.log('🔍 Verifying EXIF stripped:');
  const jpegSample = path.join(outputDir, 'headshot-01.jpg');
  const sampleMeta = await sharp(jpegSample).metadata();
  const hasExif = sampleMeta.exif !== undefined && Object.keys(sampleMeta.exif || {}).length > 0;

  if (!hasExif) {
    console.log('✓ EXIF verification PASSED\n');
  } else {
    console.warn('⚠ EXIF data still present\n');
  }

  console.log('✨ Headshots processed and ready!');
  console.log('   • public/images/about/headshots/headshot-01.webp/.jpg/_thumb.jpg');
  console.log('   • public/images/about/headshots/headshot-02.webp/.jpg/_thumb.jpg');
  console.log('\nNow update src/content/images.ts with About section entries.');
}

processHeadshots().catch(console.error);
