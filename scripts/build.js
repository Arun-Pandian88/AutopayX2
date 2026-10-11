const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Running AutoPayX Web build for Vercel...');

// 1. Build apps/web
execSync('npm run build --workspace=apps/web', { stdio: 'inherit' });

// 2. Ensure .next exists at root for Vercel root directory deployments
const rootDir = path.resolve(__dirname, '..');
const srcNext = path.join(rootDir, 'apps', 'web', '.next');
const destNext = path.join(rootDir, '.next');
const srcPublic = path.join(rootDir, 'apps', 'web', 'public');
const destPublic = path.join(rootDir, 'public');

if (fs.existsSync(srcNext)) {
  console.log('📦 Syncing .next build directory to root for Vercel...');
  try {
    if (fs.existsSync(destNext)) {
      fs.rmSync(destNext, { recursive: true, force: true });
    }
    fs.cpSync(srcNext, destNext, { recursive: true });
    console.log(`✅ Root .next successfully populated at ${destNext}`);
  } catch (err) {
    console.warn('Notice while syncing .next to root:', err.message);
  }
}

if (fs.existsSync(srcPublic) && !fs.existsSync(destPublic)) {
  try {
    fs.cpSync(srcPublic, destPublic, { recursive: true });
    console.log(`✅ Root public assets copied to ${destPublic}`);
  } catch (err) {
    console.warn('Notice while copying public assets:', err.message);
  }
}

console.log('✨ Build completed successfully for Vercel deployment!');
