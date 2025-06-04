const fs = require('fs');
const path = require('path');

// Normalize fonksiyonu
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]/g, '');
}

// Logoların bulunduğu klasörün yolunu ayarla
const logosDir = path.resolve(__dirname, '../frontend/public/logos');

// Klasörün varlığını kontrol et
if (!fs.existsSync(logosDir)) {
  console.error('Logos klasörü bulunamadı:', logosDir);
  process.exit(1);
}

// Mevcut logoları normalize et
fs.readdirSync(logosDir).forEach(file => {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.png' || ext === '.svg') {
    const base = path.basename(file, ext);
    const normalized = normalize(base) + ext;
    if (file !== normalized) {
      // Aynı isimde dosya yoksa yeniden adlandır
      if (!fs.existsSync(path.join(logosDir, normalized))) {
        fs.renameSync(path.join(logosDir, file), path.join(logosDir, normalized));
        console.log(`${file} → ${normalized}`);
      } else {
        console.warn(`Atlandı: ${normalized} zaten var!`);
      }
    }
  }
}); 