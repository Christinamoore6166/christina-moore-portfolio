import path from 'path';
import fs from 'fs';

/**
 * The only folder the image scripts may read. It is the edited set. The parent
 * "Website Photo References" folder holds the unedited originals and must never
 * be read again: processing it would overwrite the edited work.
 */
export const EDITED_SOURCE_DIR =
  'C:\\Users\\custo\\OneDrive\\CLAUDE\\Christina Personal\\Personal Website\\Website Photo References\\Edited - Clean Bright';

const norm = (p) => path.resolve(p).replace(/[\\/]+$/, '').toLowerCase();

/** Exit with an error unless sourceDir is exactly the Edited - Clean Bright folder. */
export function assertEditedSource(sourceDir) {
  if (norm(sourceDir) !== norm(EDITED_SOURCE_DIR)) {
    console.error(`✗ Refusing to run: SOURCE_DIR is not the Edited - Clean Bright folder.`);
    console.error(`  got:      ${sourceDir}`);
    console.error(`  expected: ${EDITED_SOURCE_DIR}`);
    process.exit(1);
  }
  if (!fs.existsSync(sourceDir)) {
    console.error(`✗ Source folder not found: ${sourceDir}`);
    process.exit(1);
  }
}
