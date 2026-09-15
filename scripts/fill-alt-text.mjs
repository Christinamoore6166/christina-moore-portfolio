import fs from 'fs';

const path = 'src/content/images.ts';

const banks = {
  headshots: [
    "Christina Moore smiling in a black leather jacket on a rooftop terrace, downtown skyline behind her",
    "Christina Moore smiling in a black top on a rooftop terrace, city skyline and train tracks in the background",
  ],
  'white-elephant': [
    "Holiday dinner table set with black napkins tied in red ribbon on white plates, red table runner, and a bottle of wine, city lights through the window",
    "Overhead view of the holiday dinner table with red-ribboned black napkins, a red table runner, and a centerpiece of red ornaments",
    "Drink cart set up for the White Elephant party with flavored syrups, garnishes, and a bucket of ice in front of a frosted Christmas tree and city view",
    "Wide shot of the holiday dinner table with red-ribboned napkins, red ornaments, and place settings for eight",
    "Holiday dinner table set against floor-to-ceiling windows, with a flocked Christmas tree, wrapped gifts, and a red-and-gold table runner",
  ],
  galentines: [
    "Pink and red rose table runner set with white scalloped plates and pink Happy Galentine's Day place cards",
    "Wine bottles with custom pink Galentines labels, each tied with a pink ribbon bow",
    "Red roses and pink confetti scattered across the table next to a glass of red wine",
    "Rose bottle wrapped in a pink ribbon and stamped with a lipstick-print design, surrounded by red roses",
    "Pink and burgundy rose bouquet beside a ribbon-wrapped champagne bottle and a stack of Galentine's bingo cards",
    "Close-up of a pink Happy Galentine's Day place card on a scalloped plate with gold flatware",
    "Row of wine bottles with custom pink Galentines labels lined up along a window overlooking the city",
    "Overhead view of the Galentine's Day tablescape with rose centerpiece, pink runner, and place settings",
    "Bouquet of white, pink, and red roses arranged in a glass vase on the table",
    "Pink ribbon-tied wine bottle detail against a view of the downtown skyline",
    "Table detail with red rose petals and pink confetti scattered across the runner",
    "Galentine's Day place card and pink napkin set on a white scalloped plate",
  ],
  bachelorette: [
    "Welcome to Sara's Bachelorette Weekend sign next to cowboy boot and getting-ready decor",
    "Nashville-themed gift bag with a blue sweatshirt, sunglasses, koozie, and drawstring pouch",
    "Taco and nacho bar set up on the kitchen island with named place cards for each guest",
    "Light and navy blue koozies printed with Sara's Last Rodeo, Nashville, TN",
    "Folded blue Nashville sweatshirts lined up with drawstring bags, cups, and sunglasses for each guest",
    "Bride's white robe, veil, cowboy hat, and floral makeup bag laid out for the bachelorette weekend",
    "Row of wine bottles with custom blue-and-white Sara's bachelorette labels",
    "Detail of the personalized welcome sign and cowgirl boot decorations for the bachelorette weekend",
    "Gift bag favors including a Nashville sweatshirt, sunglasses, and snacks laid out on the bed",
  ],
  friendsgiving: [
    "Place setting with a Friendsgiving card and a named linen napkin on a woven charger",
    "Espresso martini bar with handwritten instructions and mason jar cocktail shakers",
    "Wine glasses and a bottle set out on the counter with a red table runner",
    "Friendsgiving place card on a scalloped plate with a rust-colored napkin",
    "Acrylic heart-shaped martini glass charms arranged on a wood surface",
    "Dried orange slices and rust-colored napkins scattered across a cheesecloth table runner",
    "Dried orange garland along a cheesecloth runner with a place card and neutral table setting",
    "Close-up of the Friendsgiving tablescape with woven chargers and autumnal details",
    "Cocktail bar detail with mason jars, dried citrus, and a red table runner",
  ],
  'curated-gifting': [
    "Custom light-blue UConn long-sleeve shirt printed with a repeating UCONN wordmark, laid flat on a wood floor",
    "Custom light-blue UConn quarter-zip pullover on a hanger, close-up of the UCONN wordmark on the chest",
    "Close-up of a custom light-blue UConn Huskies shirt design with a repeating UCONN text pattern and the Huskies mascot",
    "Custom UConn Huskies shirt design featuring the husky mascot logo surrounded by a repeating UCONN CONNECTICUT HUSKIES text pattern",
  ],
};

const groups = [
  { section: 'about', event: 'headshots', filePrefix: 'headshot', count: 2, dims: [[1428, 1800], [1297, 1800]] },
  { section: 'branding', event: 'white-elephant', filePrefix: 'white-elephant', count: 5, dims: null },
  { section: 'branding', event: 'galentines', filePrefix: 'galentines', count: 45, dims: null },
  { section: 'other', event: 'bachelorette', filePrefix: 'bachelorette', count: 18, dims: null },
  { section: 'branding', event: 'friendsgiving', filePrefix: 'friendsgiving', count: 36, dims: null },
  { section: 'other', event: 'curated-gifting', filePrefix: 'curated-gifting', count: 4, dims: null },
];

function esc(s) {
  return s.replace(/'/g, "\\'");
}

let out = `export interface ImageAsset {
  section: 'about' | 'branding' | 'other';
  event: string;
  webp: string;
  jpg: string;
  thumbnail: string;
  width: number;
  height: number;
  alt: string;
}

export const images: ImageAsset[] = [
`;

const headings = {
  headshots: '  // About - Headshots\n',
  'white-elephant': '  // Branding - White Elephant (Dec 14, 2024)\n',
  galentines: '  // Branding - Galentines (Feb 15-16, 2025)\n',
  bachelorette: '  // Other - Bachelorette (Feb 27-28, 2025)\n',
  friendsgiving: '  // Branding - Friendsgiving (Nov 15-16, 2025)\n',
  'curated-gifting': '  // Other - Curated Gifting (Apr 14, 2025)\n',
};

for (const group of groups) {
  out += headings[group.event];
  const bank = banks[group.event];
  for (let i = 1; i <= group.count; i++) {
    const num = String(i).padStart(2, '0');
    const base = `public/images/${group.section}/${group.event}/${group.filePrefix}-${num}`;
    const [w, h] = group.dims ? group.dims[i - 1] : [1800, 1350];
    const alt = esc(bank[(i - 1) % bank.length]);
    out += `  {
    section: '${group.section}',
    event: '${group.event}',
    webp: '${base}.webp',
    jpg: '${base}.jpg',
    thumbnail: '${base}_thumb.jpg',
    width: ${w},
    height: ${h},
    alt: '${alt}',
  },
`;
  }
  out += '\n';
}

out = out.replace(/\n\n$/, '\n') + '];\n';

fs.writeFileSync(path, out);
console.log('wrote', path);
