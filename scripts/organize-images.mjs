import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

const MANIFEST_PATH = 'public/images/_unsorted/manifest.json';
const UNSORTED_DIR = 'public/images/_unsorted';

// Category mapping from dates
const DATE_TO_CATEGORY = {
  '20241214': { section: 'branding', event: 'white-elephant' },
  '20250215': { section: 'branding', event: 'galentines' },
  '20250216': { section: 'branding', event: 'galentines' },
  '20250227': { section: 'other', event: 'bachelorette' },
  '20250228': { section: 'other', event: 'bachelorette' },
  '20250414': { section: 'other', event: 'curated-gifting' },
  '20251115': { section: 'branding', event: 'friendsgiving' },
  '20251116': { section: 'branding', event: 'friendsgiving' },
};

// Read manifest
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

// Build date map by hashing
function hashFile(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    return createHash('sha256').update(buffer).digest('hex');
  } catch (e) {
    return null;
  }
}

// Load date assignments
const dateMap = {};
const SOURCE_DIR = 'C:\\Users\\custo\\OneDrive\\CLAUDE\\Christina Personal\\Personal Website\\Website Photo References';
const sourceFiles = fs.readdirSync(SOURCE_DIR);
const sourceHashes = {};

console.log('Building source file hash index...');
sourceFiles.forEach(file => {
  const hash = hashFile(path.join(SOURCE_DIR, file));
  if (hash) {
    if (!sourceHashes[hash]) sourceHashes[hash] = [];
    sourceHashes[hash].push(file);
  }
});

console.log('Assigning dates to all manifest entries...');
const categories = { branding: {}, other: {} };
const archiveList = [];

manifest.forEach(entry => {
  let date = null;
  const basename = entry.basename;

  // Extract date from iOS timestamp format
  if (basename.match(/^\d{8}/)) {
    date = basename.substring(0, 8);
  } else {
    // Try to find byte-identical file in source with timestamp
    const sourceFile = sourceFiles.find(f =>
      f.includes(basename) ||
      basename.includes(f.split('.')[0])
    );

    if (sourceFile) {
      const hash = hashFile(path.join(SOURCE_DIR, sourceFile));
      if (hash && sourceHashes[hash]) {
        const timestamped = sourceHashes[hash].find(f => f.match(/^\d{8}/));
        if (timestamped) {
          date = timestamped.substring(0, 8);
        }
      }
    }
  }

  const category = DATE_TO_CATEGORY[date];

  if (category) {
    const { section, event } = category;
    if (!categories[section][event]) {
      categories[section][event] = [];
    }
    categories[section][event].push({ ...entry, date });
  } else {
    archiveList.push({ ...entry, date });
  }
});

// Create directories and copy/rename files
console.log('\nCreating directories and copying files...');

const fileMap = {}; // Track old → new paths for manifest

for (const [section, events] of Object.entries(categories)) {
  for (const [event, files] of Object.entries(events)) {
    const eventDir = path.join('public/images', section, event);
    if (!fs.existsSync(eventDir)) {
      fs.mkdirSync(eventDir, { recursive: true });
      console.log(`✓ Created ${eventDir}`);
    }

    files.forEach((entry, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      const basename = entry.basename;

      // Copy WebP, JPEG, and thumbnail with new names
      const fileTypes = [
        { src: `${basename}.webp`, dst: `${event}-${num}.webp` },
        { src: `${basename}.jpg`, dst: `${event}-${num}.jpg` },
        { src: `${basename}_thumb.jpg`, dst: `${event}-${num}_thumb.jpg` }
      ];

      fileTypes.forEach(({ src, dst }) => {
        const srcPath = path.join(UNSORTED_DIR, src);
        const dstPath = path.join(eventDir, dst);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, dstPath);
          fileMap[src] = path.relative('public/images', dstPath);
        }
      });

      console.log(`  ${section}/${event}: ${event}-${num}`);
    });
  }
}

// Archive everything else
const archiveDir = 'public/images/_archive';
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
}

archiveList.forEach(entry => {
  const basename = entry.basename;
  const fileTypes = [`${basename}.webp`, `${basename}.jpg`, `${basename}_thumb.jpg`];

  fileTypes.forEach(file => {
    const srcPath = path.join(UNSORTED_DIR, file);
    const dstPath = path.join(archiveDir, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, dstPath);
    }
  });
});

// Generate src/content/images.ts
const imagesTsContent = generateImagesTsContent(categories, fileMap, manifest);
const imagesPath = 'src/content/images.ts';
fs.writeFileSync(imagesPath, imagesTsContent);
console.log(`\n✓ Generated ${imagesPath}`);

// Report statistics
console.log('\n📊 ORGANIZATION COMPLETE:\n');
console.log('Sorted images:');
let totalSorted = 0;
for (const [section, events] of Object.entries(categories)) {
  for (const [event, files] of Object.entries(events)) {
    console.log(`  public/images/${section}/${event}/ — ${files.length} images`);
    totalSorted += files.length;
  }
}

console.log(`\nArchived (${archiveList.length} images):`);
archiveList.forEach(entry => {
  const date = entry.date || 'unknown';
  console.log(`  ${entry.basename} (${date})`);
});

console.log(`\nTotal: ${totalSorted} sorted + ${archiveList.length} archived = ${totalSorted + archiveList.length} images`);

console.log('\nSection coverage:');
const hasBranding = Object.keys(categories.branding).length > 0;
const hasOther = Object.keys(categories.other).length > 0;
const hasAbout = false; // No about section filled
const hasCake = false;  // No cake section filled

console.log(`  about — ✗ ZERO images`);
console.log(`  branding — ${hasBranding ? '✓ ' + Object.keys(categories.branding).length + ' event(s)' : '✗ ZERO'}`);
console.log(`  cake — ✗ ZERO images`);
console.log(`  other — ${hasOther ? '✓' : '✗ ZERO'}`);

function generateImagesTsContent(categories, fileMap, manifest) {
  const imports = `import type { ReactNode } from 'react';

export interface ImageAsset {
  section: 'about' | 'branding' | 'cake' | 'other';
  event: string;
  webp: string;
  jpg: string;
  thumbnail: string;
  width: number;
  height: number;
  alt: string; // TODO: Refine alt text per image
}

export const images: ImageAsset[] = [`;

  const imageEntries = [];

  for (const [section, events] of Object.entries(categories)) {
    for (const [event, files] of Object.entries(events)) {
      files.forEach((entry, idx) => {
        const num = String(idx + 1).padStart(2, '0');
        const webpFile = `${event}-${num}.webp`;
        const jpgFile = `${event}-${num}.jpg`;

        // Find original manifest entry to get dimensions
        const manifestEntry = manifest.find(m => m.basename === entry.basename);
        const width = manifestEntry?.webp?.width || 1800;
        const height = manifestEntry?.webp?.height || 1350;

        // Generate placeholder alt text
        const eventLabel = event.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const alt = `${eventLabel} event photo`;

        const webpPath = `public/images/${section}/${event}/${webpFile}`;
        const jpgPath = `public/images/${section}/${event}/${jpgFile}`;

        imageEntries.push(`  {
    section: '${section}',
    event: '${event}',
    webp: '${webpPath}',
    jpg: '${jpgPath}',
    thumbnail: '${webpPath.replace('.webp', '_thumb.jpg')}',
    width: ${width},
    height: ${height},
    alt: '${alt}', // TODO: Refine
  }`);
      });
    }
  }

  return imports + '\n' + imageEntries.join(',\n') + '\n];\n';
}
