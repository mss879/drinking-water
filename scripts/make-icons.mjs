// Builds every icon of the site from the LUSAKO drop mark (public/brand/lusako-mark.svg), so they all match:
//
//   app/favicon.ico            16, 32 and 48 px in one file: browser tabs, bookmarks, Windows, and Google's results
//   app/icon.svg               the mark as a vector, for browsers that take one
//   app/icon1.png              192 px: the large favicon search engines prefer (Google asks for more than 48 px)
//   app/apple-icon.png         180 px on white: iPhone and iPad home screens
//   public/icons/icon-192.png  the web manifest's icons (Android home screens and installs)
//   public/icons/icon-512.png
//   public/icons/icon-maskable-512.png   on white, inside the safe zone Android crops to
//
// Next.js writes the <link> tags for the files in app/ by itself; app/manifest.ts lists the ones in public/icons.
// Run `node scripts/make-icons.mjs` after the mark changes. It uses sharp, which comes with Next.js.
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const markSvg = readFileSync(new URL("../public/brand/lusako-mark.svg", import.meta.url), "utf8");
const path = markSvg.match(/ d="([^"]+)"/)[1];
const [, , markW, markH] = markSvg.match(/viewBox="([\d.\s]+)"/)[1].trim().split(/\s+/).map(Number);
const blue = "#278CF0";

/** The mark centred on a square canvas, `fill` being the share of the width it takes. */
function svg(size, { fill, background }) {
  const scale = (size * fill) / markW;
  const x = (size - markW * scale) / 2;
  const y = (size - markH * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${
    background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : ""
  }<path fill="${blue}" transform="translate(${x.toFixed(3)} ${y.toFixed(3)}) scale(${scale.toFixed(5)})" d="${path}"/></svg>`;
}

const png = (size, options) =>
  sharp(Buffer.from(svg(size, options)))
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

/** An .ico holding PNG images (every browser since IE 11, Windows Vista on, and Google read these). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map(({ data }) => data)]);
}

// Tab-sized icons fill their square, so the drop reads at 16 px; larger ones keep the mark's usual margin.
const tab = { fill: 1 };
const loose = { fill: 0.89 };
const onWhite = { fill: 0.645, background: "#FFFFFF" };

const out = (file) => new URL(`../${file}`, import.meta.url);
const favicon = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(size, size <= 32 ? tab : { fill: 0.96 }) })));
writeFileSync(out("app/favicon.ico"), ico(favicon));
writeFileSync(out("app/icon.svg"), svg(64, { fill: 0.89 }));
writeFileSync(out("app/icon1.png"), await png(192, loose));
writeFileSync(out("app/apple-icon.png"), await sharp(await png(180, onWhite)).flatten({ background: "#FFFFFF" }).png().toBuffer());
writeFileSync(out("public/icons/icon-192.png"), await png(192, loose));
writeFileSync(out("public/icons/icon-512.png"), await png(512, loose));
writeFileSync(out("public/icons/icon-maskable-512.png"), await sharp(await png(512, onWhite)).flatten({ background: "#FFFFFF" }).png().toBuffer());
console.log("Icons written.");
