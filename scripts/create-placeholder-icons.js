#!/usr/bin/env node

/**
 * Creates minimal placeholder icon files for Electron builds
 * In production, replace with proper icon generation using image processing libraries
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Minimal 1x1 transparent PNG in base64
const minimalPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Create icons directory
const iconsDir = path.join(__dirname, '../assets/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes required by Electron
const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

console.log('Creating placeholder icon files...');

// Create PNG files for each size
sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  try {
    fs.writeFileSync(filepath, Buffer.from(minimalPng, 'base64'));
    console.log(`✓ Created ${filename}`);
  } catch (error) {
    console.error(`✗ Failed to create ${filename}:`, error.message);
  }
});

// Create main icon files
const mainIcons = [
  { name: 'icon.png', data: minimalPng },
  { name: 'icon.ico', data: minimalPng },  // This should be proper ICO format in production
  { name: 'icon.icns', data: minimalPng }  // This should be proper ICNS format in production
];

mainIcons.forEach(icon => {
  const filepath = path.join(iconsDir, icon.name);
  
  try {
    fs.writeFileSync(filepath, Buffer.from(icon.data, 'base64'));
    console.log(`✓ Created ${icon.name}`);
  } catch (error) {
    console.error(`✗ Failed to create ${icon.name}:`, error.message);
  }
});

console.log('Placeholder icons created successfully!');
console.log('Note: Replace with proper icons for production builds.');
