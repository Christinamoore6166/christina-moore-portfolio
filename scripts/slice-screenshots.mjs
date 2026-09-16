import sharp from "sharp";
import path from "node:path";

const [dir] = process.argv.slice(2);
const files = ["w390.png", "w768.png", "w1280.png", "w1920.png"];
const chunk = 1400;

for (const file of files) {
  const full = path.join(dir, file);
  const img = sharp(full);
  const meta = await img.metadata();
  let i = 0;
  for (let y = 0; y < meta.height; y += chunk) {
    const h = Math.min(chunk, meta.height - y);
    await sharp(full)
      .extract({ left: 0, top: y, width: meta.width, height: h })
      .toFile(path.join(dir, file.replace(".png", "") + "_" + i + ".png"));
    i++;
  }
  console.log(file, meta.width, meta.height, "slices:", i);
}
