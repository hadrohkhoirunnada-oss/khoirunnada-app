const fs = require('fs');
const path = require('path');

const [,, targetPath, base64Content] = process.argv;
if (!targetPath || !base64Content) {
  console.error('Usage: node scripts/save.js <targetPath> <base64Content>');
  process.exit(1);
}

const fullPath = path.resolve(process.cwd(), targetPath);
fs.mkdirSync(path.dirname(fullPath), { recursive: true });
const buffer = Buffer.from(base64Content, 'base64');
fs.writeFileSync(fullPath, buffer);
console.log('Saved: ' + targetPath + ' (' + buffer.length + ' bytes)');
