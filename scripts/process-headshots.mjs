import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { assertEditedSource } from './source-guard.mjs';

// The edited set only. assertEditedSource exits if this is anything else.
const SOURCE_DIR = 'C:\\Users\\custo\\OneDrive\\CLAUDE\\Christina Personal\\Personal Website\\Website Photo References\\Edited - Clean Bright';
assertEditedSource(SOURCE_DIR);

// Exactly two files. Both are already edited: resize and strip EXIF only.
// "Seondar" is the real filename on disk.
const sourceFiles = [
  path.join(SOURCE_DIR, 'Primary Headshot High Res.jpg'), // hero  -> headshot-01
  path.join(SOURCE_DIR, 'Seondar Headshot High Res.jpg'), // About -> headshot-02
];

const outputDir = 'public/images/about/headshots';
const LONG_EDGE = 2400;
const THUMB_SIZE = 400;

async function processHeadshots() {
  console.log('Processing headshots...\n');

  const manifest = [];

  for (let idx = 0; idx < sourceFiles.length; idx++) {
    const inputPath = sourceFiles[idx];
    const num = String(idx + 1).padStart(2, '0');
    const basename = `headshot-${num}`;

    try {
      const buffer = fs.readFileSync(inputPath);
      const metadata = await sharp(buffer).metadata();

      if (!metadata || !metadata.width || !metadata.height) {
        throw new Error('Invalid image dimensions');
      }

      console.log(`Processing: ${path.basename(inputPath)}`);
      console.log(`  Dimensions: ${metadata.width}x${metadata.height}`);

      // withoutEnlargement: a source already at or under the cap keeps its size.
      const resize = { fit: 'inside', withoutEnlargement: true };

      // WebP (sharp drops all metadata unless asked to keep it)
      const webpPath = path.join(outputDir, `${basename}.webp`);
      await sharp(buffer)
        .rotate()
        .resize(LONG_EDGE, LONG_EDGE, resize)
        .toFormat('webp', { quality: 80 })
        .toFile(webpPath);

      // JPEG
      const jpegPath = path.join(outputDir, `${basename}.jpg`);
      await sharp(buffer)
        .rotate()
        .resize(LONG_EDGE, LONG_EDGE, resize)
        .toFormat('jpeg', { quality: 82, progressive: true })
        .toFile(jpegPath);

      // Thumbnail
      const thumbPath = path.join(outputDir, `${basename}_thumb.jpg`);
      await sharp(buffer)
        .rotate()
        .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover' })
        .toFormat('jpeg', { quality: 80, progressive: true })
        .toFile(thumbPath);

      const out = await sharp(jpegPath).metadata();
      console.log(`  Output: ${out.width}x${out.height}`);
      console.log(`  ✓ ${basename}.webp (${fs.statSync(webpPath).size} bytes)`);
      console.log(`  ✓ ${basename}.jpg (${fs.statSync(jpegPath).size} bytes)`);
      console.log(`  ✓ ${basename}_thumb.jpg (${fs.statSync(thumbPath).size} bytes)\n`);

      manifest.push({ basename, width: out.width, height: out.height });
    } catch (err) {
      console.error(`✗ Failed: ${basename} — ${err.message}\n`);
      process.exitCode = 1;
    }
  }

  // Verify EXIF stripping on every output
  console.log('🔍 Verifying EXIF stripped:');
  let dirty = 0;
  for (const { basename } of manifest) {
    for (const file of [`${basename}.jpg`, `${basename}.webp`, `${basename}_thumb.jpg`]) {
      const meta = await sharp(path.join(outputDir, file)).metadata();
      const hasExif = meta.exif !== undefined && Object.keys(meta.exif || {}).length > 0;
      if (hasExif || meta.icc !== undefined) {
        dirty++;
        console.warn(`⚠ Metadata present on ${file}`);
      }
    }
  }
  if (dirty === 0) {
    console.log('✓ EXIF verification PASSED\n');
  } else {
    console.warn('⚠ EXIF data still present\n');
    process.exitCode = 1;
  }

  console.log('✨ Headshots processed and ready!');
  console.log('   • public/images/about/headshots/headshot-01.webp/.jpg/_thumb.jpg');
  console.log('   • public/images/about/headshots/headshot-02.webp/.jpg/_thumb.jpg');
  console.log('\nNow update width and height in src/content/images.ts (scripts/sync-images-manifest.mjs).');
}

processHeadshots().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
