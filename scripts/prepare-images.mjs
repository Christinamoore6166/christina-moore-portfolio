import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { spawnSync } from 'child_process';
import sharp from 'sharp';
import heicConvert from 'heic-convert';
import ffmpegPath from 'ffmpeg-static';

const SOURCE_DIR = 'C:\\Users\\custo\\OneDrive\\CLAUDE\\Christina Personal\\Personal Website\\Website Photo References';
const OUTPUT_DIR = 'public/images/_unsorted';
const LONG_EDGE = 1800;
const THUMB_SIZE = 400;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const manifest = [];
const thumbnails = [];
let processedCount = 0;
let skippedCount = 0;
let heicSuccessCount = 0;
let heicFailedCount = 0;

// Step 1: Hash all source files for deduplication
async function hashFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  return createHash('sha256').update(buffer).digest('hex');
}

async function deduplicateFiles() {
  console.log('🔍 Deduplicating files by content hash...\n');

  const files = fs.readdirSync(SOURCE_DIR);
  const hashes = new Map(); // hash -> { path, name }
  const toProcess = [];

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    try {
      const hash = await hashFile(filePath);

      if (hashes.has(hash)) {
        // Duplicate found
        const existing = hashes.get(hash);
        // Prefer shorter name (IMG_/Tezza over timestamp)
        const existingName = existing.name;
        if (file.length < existingName.length) {
          // New file is shorter, use it instead
          hashes.set(hash, { path: filePath, name: file });
        }
      } else {
        hashes.set(hash, { path: filePath, name: file });
      }
    } catch (err) {
      console.error(`✗ Failed to hash ${file}: ${err.message}`);
      skippedCount++;
    }
  }

  // Collect unique files
  for (const [hash, { path: filePath, name }] of hashes) {
    toProcess.push({ path: filePath, name });
  }

  console.log(`Found ${hashes.size} unique photos (deduplicated from ${files.length} files)\n`);
  return toProcess;
}

async function convertHeic(inputPath) {
  try {
    const buffer = fs.readFileSync(inputPath);
    const jpegBuffer = await heicConvert({
      buffer,
      format: 'JPEG'
    });
    return Buffer.isBuffer(jpegBuffer) ? jpegBuffer : Buffer.from(jpegBuffer);
  } catch (err) {
    throw new Error(`HEIC decode failed: ${err.message}`);
  }
}

async function processImage(inputPath, basename) {
  const nameWithoutExt = basename.replace(/\.[^.]+$/, '');

  try {
    let imageBuffer;
    let isHeic = false;

    // Read file and handle HEIC conversion
    if (inputPath.toLowerCase().endsWith('.heic')) {
      isHeic = true;
      imageBuffer = await convertHeic(inputPath);
      heicSuccessCount++;
    } else {
      imageBuffer = fs.readFileSync(inputPath);
    }

    // Get metadata from buffer
    const metadata = await sharp(imageBuffer).metadata();

    if (!metadata || !metadata.width || !metadata.height || metadata.width <= 0 || metadata.height <= 0) {
      console.error(`✗ Skipped: ${basename} — invalid dimensions`);
      skippedCount++;
      return;
    }

    // Calculate resized dimensions
    const { width, height } = metadata;
    let resizeWidth = LONG_EDGE;
    let resizeHeight = LONG_EDGE;

    if (width > height) {
      resizeHeight = Math.round((LONG_EDGE / width) * height);
    } else {
      resizeWidth = Math.round((LONG_EDGE / height) * width);
    }

    // WebP output - strips all metadata via toFormat
    const webpPath = path.join(OUTPUT_DIR, `${nameWithoutExt}.webp`);
    await sharp(imageBuffer)
      .rotate()
      .resize(resizeWidth, resizeHeight, { fit: 'inside', withoutEnlargement: true })
      .toFormat('webp', { quality: 80 })
      .toFile(webpPath);

    // JPEG output
    const jpegPath = path.join(OUTPUT_DIR, `${nameWithoutExt}.jpg`);
    await sharp(imageBuffer)
      .rotate()
      .resize(resizeWidth, resizeHeight, { fit: 'inside', withoutEnlargement: true })
      .toFormat('jpeg', { quality: 82, progressive: true })
      .toFile(jpegPath);

    // Thumbnail
    const thumbPath = path.join(OUTPUT_DIR, `${nameWithoutExt}_thumb.jpg`);
    await sharp(imageBuffer)
      .rotate()
      .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover' })
      .toFormat('jpeg', { quality: 80, progressive: true })
      .toFile(thumbPath);

    // Add to manifest
    const webpStats = fs.statSync(webpPath);
    const jpegStats = fs.statSync(jpegPath);
    const thumbStats = fs.statSync(thumbPath);

    manifest.push({
      original: basename,
      basename: nameWithoutExt,
      format: isHeic ? 'heic-converted' : 'native',
      webp: { file: `${nameWithoutExt}.webp`, size: webpStats.size, width: resizeWidth, height: resizeHeight },
      jpeg: { file: `${nameWithoutExt}.jpg`, size: jpegStats.size, width: resizeWidth, height: resizeHeight },
      thumbnail: { file: `${nameWithoutExt}_thumb.jpg`, size: thumbStats.size, width: THUMB_SIZE, height: THUMB_SIZE }
    });

    thumbnails.push({ basename: nameWithoutExt, file: `${nameWithoutExt}_thumb.jpg` });

    processedCount++;
    const typeStr = isHeic ? ' (HEIC→JPEG)' : '';
    console.log(`✓ ${processedCount}. ${basename}${typeStr}`);
  } catch (err) {
    console.error(`✗ Failed: ${basename} — ${err.message}`);
    if (inputPath.toLowerCase().endsWith('.heic')) {
      heicFailedCount++;
    }
    skippedCount++;
  }
}

async function verifyExifStripped() {
  console.log('\n🔍 Verifying EXIF stripping on samples...');
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.jpg') && !f.includes('thumb'));

  if (files.length === 0) {
    console.warn('⚠ No JPEG files to verify');
    return;
  }

  // Check one native JPG and one converted HEIC if available
  const nativeJpeg = files.find(f => {
    const entry = manifest.find(m => m.jpeg.file === f);
    return entry && entry.format === 'native';
  });

  const heicConverted = files.find(f => {
    const entry = manifest.find(m => m.jpeg.file === f);
    return entry && entry.format === 'heic-converted';
  });

  for (const jpegFile of [nativeJpeg, heicConverted].filter(Boolean)) {
    try {
      const metadata = await sharp(path.join(OUTPUT_DIR, jpegFile)).metadata();
      const hasExif = metadata.exif !== undefined && Object.keys(metadata.exif || {}).length > 0;
      const hasIcc = metadata.icc !== undefined;

      const type = manifest.find(m => m.jpeg.file === jpegFile)?.format === 'heic-converted' ? '(HEIC converted)' : '(native)';
      if (!hasExif && !hasIcc) {
        console.log(`✓ EXIF clean on ${jpegFile} ${type}`);
      } else {
        console.warn(`⚠ WARNING: EXIF still present on ${jpegFile}: {exif: ${hasExif}, icc: ${hasIcc}}`);
      }
    } catch (err) {
      console.error(`✗ Verification failed on ${jpegFile}: ${err.message}`);
    }
  }
}

async function generateContactSheet() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Photo Contact Sheet</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 40px 20px; }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { margin-bottom: 10px; font-size: 28px; color: #333; }
    .subtitle { color: #666; margin-bottom: 30px; font-size: 14px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 20px; }
    .tile { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s; }
    .tile:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .tile img { display: block; width: 100%; height: 120px; object-fit: cover; }
    .label { padding: 8px; font-size: 11px; color: #666; word-break: break-all; line-height: 1.3; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📸 Contact Sheet</h1>
    <p class="subtitle">${processedCount} unique photos processed • All EXIF metadata stripped</p>
    <div class="grid">
${thumbnails.map(t => `      <div class="tile">
        <img src="${t.file}" alt="${t.basename}" loading="lazy">
        <div class="label">${t.basename}</div>
      </div>`).join('\n')}
    </div>
  </div>
</body>
</html>`;

  const contactSheetPath = 'scripts/contact-sheet.html';
  fs.writeFileSync(contactSheetPath, html);
  console.log(`\n✓ Contact sheet: ${contactSheetPath}`);
}

async function main() {
  console.log(`📂 Reading from: ${SOURCE_DIR}\n`);

  // Step 1: Deduplicate
  const uniqueFiles = await deduplicateFiles();

  // Step 2: Process each unique file
  for (const { path: filePath, name } of uniqueFiles) {
    const ext = name.toLowerCase().split('.').pop();
    if (['heic', 'jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      await processImage(filePath, name);
    }
  }

  // Write manifest
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest: ${manifestPath}`);

  // Verify EXIF stripping
  await verifyExifStripped();

  // Generate contact sheet
  await generateContactSheet();

  console.log(`\n✨ Complete:`);
  console.log(`   • ${processedCount} unique photos processed`);
  console.log(`   • ${heicSuccessCount} HEIC files converted`);
  console.log(`   • ${heicFailedCount} HEIC files failed`);
  console.log(`   • ${skippedCount} files skipped/failed\n`);
}

main().catch(console.error);
