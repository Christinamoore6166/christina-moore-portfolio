import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

const SOURCE_DIR = 'C:\\Users\\custo\\OneDrive\\CLAUDE\\Christina Personal\\Personal Website\\Website Photo References';
const MANIFEST_PATH = 'public/images/_unsorted/manifest.json';

function hashFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  return createHash('sha256').update(buffer).digest('hex');
}

// Read manifest
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

// Build hash map of source files
const sourceHashes = {};
const sourceFiles = fs.readdirSync(SOURCE_DIR);

console.log(`Building hash index of ${sourceFiles.length} source files...`);
sourceFiles.forEach((file, idx) => {
  if (idx % 20 === 0) console.log(`  ${idx}/${sourceFiles.length}`);
  const sourcePath = path.join(SOURCE_DIR, file);
  try {
    const hash = hashFile(sourcePath);
    if (!sourceHashes[hash]) sourceHashes[hash] = [];
    sourceHashes[hash].push(file);
  } catch (e) {
    // skip
  }
});

console.log(`\nMatching ${manifest.length} processed files...\n`);

const dateMap = {};
manifest.forEach(entry => {
  const basename = entry.basename;

  // Extract date from iOS format
  let date = null;
  if (basename.match(/^\d{8}/)) {
    const dateStr = basename.substring(0, 8);
    date = dateStr;
  } else if (basename.match(/^IMG_\d/)) {
    // Try to find byte-identical file with timestamp
    const originalFile = sourceFiles.find(f => f.includes(basename) || basename.includes(f.split('.')[0]));
    if (originalFile) {
      const sourcePath = path.join(SOURCE_DIR, originalFile);
      try {
        const hash = hashFile(sourcePath);
        // Find other files with same hash
        const twins = sourceHashes[hash];
        const timestamped = twins?.find(f => f.match(/^\d{8}/));
        if (timestamped) {
          date = timestamped.substring(0, 8);
        }
      } catch (e) {}
    }
  }

  if (basename.match(/^Tezza-/)) {
    // Tezza files are edits of other shots - find which ones
    const sourceFile = sourceFiles.find(f => f.toLowerCase() === basename.toLowerCase() + '.jpg');
    if (sourceFile) {
      const sourcePath = path.join(SOURCE_DIR, sourceFile);
      try {
        const hash = hashFile(sourcePath);
        const twins = sourceHashes[hash];
        const timestamped = twins?.find(f => f.match(/^\d{8}/));
        if (timestamped) {
          date = timestamped.substring(0, 8);
        }
      } catch (e) {}
    }
  }

  if (date) {
    if (!dateMap[date]) dateMap[date] = [];
    dateMap[date].push(basename);
  } else {
    if (!dateMap['UNKNOWN']) dateMap['UNKNOWN'] = [];
    dateMap['UNKNOWN'].push(basename);
  }
});

// Display results
console.log('Photos grouped by capture date:\n');
Object.keys(dateMap).sort().forEach(date => {
  const count = dateMap[date].length;
  if (date === 'UNKNOWN') {
    console.log(`[NO DATE] (${count} files):`);
  } else {
    console.log(`${date} (${count} files):`);
  }
  dateMap[date].slice(0, 5).forEach(f => console.log(`  - ${f}`));
  if (dateMap[date].length > 5) console.log(`  ... and ${dateMap[date].length - 5} more`);
  console.log();
});
