/**
 * Generate PWA Icons Script
 * 
 * This script generates the required PWA icons for the Decision Timeout app.
 * You'll need to install sharp: npm install sharp --save-dev
 * 
 * Then run: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// SVG source for the app icon (decision timeout clock)
const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#2563EB"/>
  <circle cx="256" cy="256" r="180" fill="none" stroke="white" stroke-width="12"/>
  <path d="M256 120 L256 256 L360 360" stroke="white" stroke-width="16" stroke-linecap="round"/>
  <text x="256" y="400" font-family="sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">DECIDE</text>
</svg>
`;

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 96, name: 'icon-96.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' }
];

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  try {
    // Create icons directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    for (const { size, name } of sizes) {
      const outputPath = path.join(publicDir, name);
      
      await sharp(Buffer.from(iconSvg))
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${name} (${size}x${size})`);
    }
    
    // Generate maskable icon (special PWA format)
    const maskableIconSvg = `
    <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#2563EB"/>
      <circle cx="256" cy="256" r="140" fill="none" stroke="white" stroke-width="10"/>
      <path d="M256 140 L256 256 L340 340" stroke="white" stroke-width="12" stroke-linecap="round"/>
    </svg>
    `;
    
    await sharp(Buffer.from(maskableIconSvg))
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192-maskable.png'));
    
    console.log('✓ Generated icon-192-maskable.png (192x192)');
    
    // Generate Apple Touch Icon
    await sharp(Buffer.from(iconSvg))
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    
    console.log('✓ Generated apple-touch-icon.png (180x180)');
    
    console.log('\n🎉 All PWA icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your manifest.json to reference these icons');
    console.log('2. Add favicon links to your HTML head section');
    console.log('3. Test your PWA installation on mobile devices');
    
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

// Only run if called directly (not imported)
if (require.main === module) {
  generateIcons();
}

module.exports = { generateIcons };