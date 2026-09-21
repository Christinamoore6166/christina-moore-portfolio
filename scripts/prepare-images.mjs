import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import sharp from 'sharp';
import heicConvert from 'heic-convert';
import { assertEditedSource } from './source-guard.mjs';

// The edited set only. assertEditedSource exits if this is anything else.
const SOURCE_DIR = 'C:\\Users\\custo\\OneDrive\\CLAUDE\\Christina Personal\\Personal Website\\Website Photo References\\Edited - Clean Bright';
assertEditedSource(SOURCE_DIR);

// sharp caches open file handles by default, which locks files on Windows.
sharp.cache(false);

const OUTPUT_DIR = 'public/images/_unsorted';
const PLACEMENT_PATH = 'scripts/image-placement.json';
const THUMB_SIZE = 400;
const STANDARD_LONG_EDGE = 2400;
const WIDE_LONG_EDGE = 3200;
// Basenames (no extension) that take the wide cap. Everything else takes 2400.
// withoutEnlargement means a source smaller than its cap keeps its own size.
const WIDE = new Set([
  'Galentines Wide',
  'Friendsgiving 2 wide',
  'friendsgiving wide',
  'White Elephant Wide',
  'Nashville Large',
  'Linen_Large',
  'Buttercream Large',
  'Tablescape Large',
]);
const longEdgeFor = (nameWithoutExt) => (WIDE.has(nameWithoutExt) ? WIDE_LONG_EDGE : STANDARD_LONG_EDGE);

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

    // Fit inside the per-file cap. withoutEnlargement below means the real
    // output size is read back from disk for the manifest.
    const LONG_EDGE = longEdgeFor(nameWithoutExt);
    const resizeWidth = LONG_EDGE;
    const resizeHeight = LONG_EDGE;

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

    const outMeta = await sharp(jpegPath).metadata();
    manifest.push({
      original: basename,
      basename: nameWithoutExt,
      format: isHeic ? 'heic-converted' : 'native',
      webp: { file: `${nameWithoutExt}.webp`, size: webpStats.size, width: outMeta.width, height: outMeta.height },
      jpeg: { file: `${nameWithoutExt}.jpg`, size: jpegStats.size, width: outMeta.width, height: outMeta.height },
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

/** Every file written this run (jpg, webp, thumb) must carry no EXIF and no ICC. */
async function verifyExifStripped() {
  console.log('\n🔍 Verifying EXIF stripping on every output...');
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => /\.(jpg|webp)$/.test(f));
  let dirty = 0;

  for (const file of files) {
    try {
      const metadata = await sharp(path.join(OUTPUT_DIR, file)).metadata();
      const hasExif = metadata.exif !== undefined && Object.keys(metadata.exif || {}).length > 0;
      const hasIcc = metadata.icc !== undefined;
      if (hasExif || hasIcc) {
        dirty++;
        console.warn(`⚠ Metadata present on ${file}: {exif: ${hasExif}, icc: ${hasIcc}}`);
      }
    } catch (err) {
      dirty++;
      console.error(`✗ Verification failed on ${file}: ${err.message}`);
    }
  }
  console.log(dirty === 0 ? `✓ ${files.length} files checked, none carry EXIF or ICC` : `✗ ${dirty} of ${files.length} files carry metadata`);
  return dirty === 0;
}

/** Lists every asset basename under the section folders, minus extension and _thumb. */
function sectionBasenames() {
  const found = new Map(); // basename -> [dir, ...]
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(jpg|webp)$/.test(entry.name)) {
        const base = entry.name.replace(/_thumb\.jpg$/, '').replace(/\.(jpg|webp)$/, '');
        const dirs = found.get(base) ?? new Set();
        dirs.add(path.dirname(full).split(path.sep).join('/'));
        found.set(base, dirs);
      }
    }
  };
  for (const section of ['about', 'branding', 'other', 'stock']) walk(path.join('public/images', section));
  return found;
}

/**
 * Precondition, run before anything is written: no basename may appear in
 * more than one section folder, and no new file may land on an existing name
 * in a different folder. On any collision, list them and stop.
 */
function checkCollisions(placement) {
  const existing = sectionBasenames();
  const collisions = [];
  for (const [base, dirs] of existing) {
    if (dirs.size > 1) collisions.push(`${base} exists in: ${[...dirs].join(', ')}`);
  }
  const newTargets = [
    ...Object.values(placement.add),
    ...Object.values(placement.stock).filter(s => s.action === 'spare').map(s => s.out),
  ];
  for (const target of newTargets) {
    const base = path.basename(target);
    const dir = path.dirname(target).split(path.sep).join('/');
    const dirs = existing.get(base);
    if (dirs && !dirs.has(dir)) collisions.push(`new file ${base} would land in ${dir} but already exists in: ${[...dirs].join(', ')}`);
  }
  if (collisions.length > 0) {
    console.error('✗ Basename collisions. Nothing was written. Resolve these first:');
    for (const c of collisions) console.error(`  - ${c}`);
    process.exit(1);
  }
  console.log(`✓ No basename collisions across ${existing.size} existing assets in about/branding/other/stock\n`);
}

/** Windows can briefly lock a file (indexer, AV). Retry a few times before failing. */
function copyWithRetry(from, to, attempts = 5) {
  for (let i = 1; ; i++) {
    try {
      fs.copyFileSync(from, to);
      return;
    } catch (err) {
      if (i >= attempts) throw err;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200 * i);
    }
  }
}

const totalBytes = (files) => files.reduce((sum, f) => sum + fs.statSync(f).size, 0);

/**
 * Copies each processed output over the file it replaces, matched by basename
 * through scripts/image-placement.json, into that file's own section folder.
 * Nothing is hand sorted. Any missing output fails loudly before any copy.
 */
function placeOutputs(placement) {
  const jobs = []; // { from, to }
  const missing = [];
  const queue = (srcName, target, kinds) => {
    for (const kind of kinds) {
      const suffix = kind === 'thumb' ? '_thumb.jpg' : `.${kind}`;
      const from = path.join(OUTPUT_DIR, `${srcName}${suffix}`);
      if (!fs.existsSync(from)) missing.push(from);
      jobs.push({ from, to: `${target}${suffix}` });
    }
  };
  for (const [target, srcName] of Object.entries(placement.replace)) queue(srcName, target, ['webp', 'jpg', 'thumb']);
  for (const [srcName, target] of Object.entries(placement.add)) queue(srcName, target, ['webp', 'jpg', 'thumb']);
  for (const [srcName, s] of Object.entries(placement.stock)) queue(srcName, s.out, ['jpg']);

  if (missing.length > 0) {
    console.error(`✗ ${missing.length} processed outputs are missing, so nothing was placed:`);
    for (const m of missing) console.error(`  - ${m}`);
    process.exit(1);
  }

  const replacedBefore = jobs.filter(j => fs.existsSync(j.to));
  const before = totalBytes(replacedBefore.map(j => j.to));
  let after = 0;
  let replaced = 0;
  let added = 0;
  for (const { from, to } of jobs) {
    const existed = fs.existsSync(to);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    copyWithRetry(from, to);
    after += fs.statSync(to).size;
    if (existed) replaced++;
    else added++;
  }
  console.log(`✓ Placed ${jobs.length} files: ${replaced} replaced, ${added} added`);
  console.log(`  replaced files: ${(before / 1048576).toFixed(1)} MB before, ${(after / 1048576).toFixed(1)} MB after (incl. added)`);
}

/**
 * Stock backdrops that stay portrait keep their existing file. Cap them at
 * 3200 on the long edge, with no colour change. Skipped when already capped, so
 * a second run does not recompress.
 */
async function capPortraitStock(placement) {
  const replacedOut = new Set(Object.values(placement.stock).map(s => s.out + '.jpg'));
  const stockDir = 'public/images/stock';
  for (const file of fs.readdirSync(stockDir).filter(f => f.endsWith('.jpg'))) {
    const full = `${stockDir}/${file}`;
    if (replacedOut.has(full)) continue;
    // Read into a buffer: sharp keeps a file open on Windows, which blocks the rewrite.
    const input = fs.readFileSync(full);
    const meta = await sharp(input).metadata();
    if (Math.max(meta.width, meta.height) <= WIDE_LONG_EDGE) {
      console.log(`  stock ${file}: ${meta.width}x${meta.height}, already within ${WIDE_LONG_EDGE}, left as is`);
      continue;
    }
    const buf = await sharp(input)
      .rotate()
      .resize(WIDE_LONG_EDGE, WIDE_LONG_EDGE, { fit: 'inside', withoutEnlargement: true })
      .toFormat('jpeg', { quality: 82, progressive: true })
      .toBuffer({ resolveWithObject: true });
    fs.writeFileSync(full, buf.data);
    console.log(`  stock ${file}: ${meta.width}x${meta.height} -> ${buf.info.width}x${buf.info.height} (kept in place, capped)`);
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

  const placement = JSON.parse(fs.readFileSync(PLACEMENT_PATH, 'utf8'));
  checkCollisions(placement);

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
  if (!(await verifyExifStripped())) {
    console.error('✗ Metadata found in outputs. Nothing was placed into section folders.');
    process.exit(1);
  }

  // Step 3: put each output over the file it replaces, in its own section folder
  placeOutputs(placement);
  console.log('\n🖼  Stock backdrops kept in place:');
  await capPortraitStock(placement);

  // Generate contact sheet
  await generateContactSheet();

  console.log(`\n✨ Complete:`);
  console.log(`   • ${processedCount} unique photos processed`);
  console.log(`   • ${heicSuccessCount} HEIC files converted`);
  console.log(`   • ${heicFailedCount} HEIC files failed`);
  console.log(`   • ${skippedCount} files skipped/failed\n`);
}

main().catch(console.error);
