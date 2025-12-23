const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputIcon = path.join(__dirname, '..', 'icon.png');
const publicDir = path.join(__dirname, '..', 'public');

async function generateIcons() {
  try {
    // Check if input icon exists
    if (!fs.existsSync(inputIcon)) {
      console.error('❌ Error: icon.png not found in root directory');
      console.log('📝 Please place your icon.png file in the root project folder');
      process.exit(1);
    }

    console.log('📸 Reading source icon...');
    const iconBuffer = fs.readFileSync(inputIcon);

    // Get original dimensions
    const metadata = await sharp(iconBuffer).metadata();
    console.log(`✅ Source icon: ${metadata.width}x${metadata.height}`);

    if (metadata.width < 512 || metadata.height < 512) {
      console.warn('⚠️  Warning: Source icon is smaller than 512x512px. Quality may be reduced.');
      console.warn('   Recommended: Use at least 512x512px or higher');
    }

    console.log('\n🔄 Generating icon sizes...\n');

    // Generate all sizes
    for (const size of sizes) {
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);

      await sharp(iconBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated: icon-${size}x${size}.png`);
    }

    // Generate favicon
    await sharp(iconBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.png'));
    console.log('✅ Generated: favicon.png');

    // Generate apple-touch-icon
    await sharp(iconBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✅ Generated: apple-touch-icon.png');

    // Copy original
    fs.copyFileSync(inputIcon, path.join(publicDir, 'icon.png'));
    console.log('✅ Copied: icon.png to public/');

    console.log('\n🎉 All icons generated successfully!');
    console.log('\n📱 Your PWA is ready with the new logo!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateIcons();
