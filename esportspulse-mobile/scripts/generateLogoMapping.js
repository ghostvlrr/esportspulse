const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, '../assets/logos');
const outputFile = path.join(logosDir, 'index.ts');

const files = fs.readdirSync(logosDir).filter(f => f.endsWith('.png'));

let mapping = 'export const teamLogos: Record<string, any> = {\n';
files.forEach(file => {
  const key = file.replace('.png', '').toLowerCase();
  mapping += `  "${key}": require("./${file}"),\n`;
});
mapping += '};\n';

fs.writeFileSync(outputFile, mapping);
console.log('Logo mapping dosyası güncellendi:', outputFile); 