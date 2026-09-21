import fs from 'fs';
import sharp from 'sharp';

/**
 * Brings src/content/images.ts in step with the files on disk: width and
 * height from the shipped file, and a tiny blur placeholder (blurDataURL).
 * images.ts references photos by path string, so next/image cannot make a
 * blur placeholder from a static import. This is the hand-supplied route.
 *
 * Only width, height and blur are written. Alt text and every other field is
 * left exactly as it is. The graphic-design logos are skipped.
 */
sharp.cache(false);

const FILE = 'src/content/images.ts';
const BLUR_EDGE = 12;
const src = fs.readFileSync(FILE, 'utf8');

async function blurFor(buf) {
  const out = await sharp(buf)
    .rotate()
    .resize(BLUR_EDGE, BLUR_EDGE, { fit: 'inside' })
    .toFormat('webp', { quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${out.toString('base64')}`;
}

const blocks = [...src.matchAll(/^  \{\n([\s\S]*?)\n  \},?$/gm)];
let out = '';
let cursor = 0;
let touched = 0;
let skipped = 0;

for (const m of blocks) {
  const body = m[1];
  const pathMatch = body.match(/^\s*(?:webp|jpg): '([^']+)'/m);
  if (!pathMatch) continue;
  const p = pathMatch[1];
  // The dimension source is the file the component renders: webp for photos, jpg for stock.
  const file = body.match(/^\s*webp: '([^']+)'/m)?.[1] ?? p;

  out += src.slice(cursor, m.index);
  cursor = m.index + m[0].length;

  if (p.includes('/graphic-design/')) {
    out += m[0];
    skipped++;
    continue;
  }

  const buf = fs.readFileSync(file);
  const meta = await sharp(buf).metadata();
  const blur = await blurFor(buf);

  let next = m[0]
    .replace(/^(\s*width: )\d+,$/m, `$1${meta.width},`)
    .replace(/^(\s*height: )\d+,$/m, `$1${meta.height},`)
    .replace(/^\s*blur: '[^']*',\n/m, '');
  next = next.replace(/^(\s*height: \d+,)$/m, `$1\n    blur: '${blur}',`);
  out += next;
  touched++;
}
out += src.slice(cursor);

fs.writeFileSync(FILE, out);
console.log(`✓ ${FILE}: ${touched} entries synced, ${skipped} graphic-design logos left alone`);
