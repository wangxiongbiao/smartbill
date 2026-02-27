const Jimp = require('jimp');

async function main() {
  try {
    const image = await Jimp.read('./public/hero-illustration-v2.png');
    image.autocrop(); // Automatically crops same-color borders
    await image.writeAsync('./public/hero-illustration-v2-cropped.png');
    console.log("Cropped successfully to hero-illustration-v2-cropped.png");
  } catch (err) {
    console.error(err);
  }
}

main();
