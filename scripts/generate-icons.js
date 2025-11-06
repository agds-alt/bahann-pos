#!/usr/bin/env node

/**
 * Simple PWA Icon Generator
 * Generates placeholder PNG icons from a text-based design
 * No dependencies required - uses Node.js built-in canvas
 */

const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Try to use canvas if available, otherwise show instructions
try {
  const { createCanvas } = require('canvas');

  console.log('📱 Generating PWA icons...\n');

  sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, size, size);

    // Text "AGDS"
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.25}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AGDS', size / 2, size * 0.4);

    // Text "POS"
    ctx.fillStyle = '#60a5fa';
    ctx.font = `bold ${size * 0.16}px Arial`;
    ctx.fillText('POS', size / 2, size * 0.62);

    // Decorative line
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = size * 0.01;
    ctx.beginPath();
    ctx.moveTo(size * 0.25, size * 0.8);
    ctx.lineTo(size * 0.75, size * 0.8);
    ctx.stroke();

    // Save PNG
    const buffer = canvas.toBuffer('image/png');
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(__dirname, '..', 'public', filename);
    fs.writeFileSync(filepath, buffer);

    console.log(`✅ Generated: ${filename}`);
  });

  console.log('\n✨ All icons generated successfully!');
  console.log('📍 Icons saved to: /public/icon-*.png\n');

} catch (error) {
  console.log('⚠️  Canvas module not found. Installing it...\n');
  console.log('Run this command to install canvas:');
  console.log('  npm install canvas\n');
  console.log('Or use alternative icon generation methods:');
  console.log('  1. Online: https://realfavicongenerator.net/');
  console.log('  2. ImageMagick: See /public/ICONS_README.md');
  console.log('  3. Any image editor (Photoshop, Figma, etc.)\n');
}
