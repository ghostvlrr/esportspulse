const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processEventLogos() {
    try {
        // Kaynak ve hedef klasörleri
        const sourceDir = path.join(__dirname, '../../frontend/public/events');
        const targetDir = path.join(__dirname, '../../frontend/public/events/processed');

        // Hedef klasörü oluştur
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Kaynak klasördeki tüm dosyaları oku
        const files = fs.readdirSync(sourceDir);

        for (const file of files) {
            if (file.endsWith('.png')) {
                const sourcePath = path.join(sourceDir, file);
                const fileName = file.toLowerCase()
                    .replace(/[^a-z0-9]/g, '_')
                    .replace(/_+/g, '_')
                    .replace(/^_|_$/g, '');
                
                const targetPath = path.join(targetDir, fileName);

                try {
                    // Görüntüyü işle
                    await sharp(sourcePath)
                        .resize(200, 200, { // Logo boyutunu standardize et
                            fit: 'contain',
                            background: { r: 0, g: 0, b: 0, alpha: 0 }
                        })
                        .png({ quality: 90 })
                        .toFile(targetPath);

                    console.log(`İşlendi: ${fileName}`);
                } catch (error) {
                    console.error(`${file} işlenirken hata:`, error.message);
                }
            }
        }

        console.log('Tüm logolar işlendi!');
    } catch (error) {
        console.error('Hata:', error);
    }
}

processEventLogos(); 