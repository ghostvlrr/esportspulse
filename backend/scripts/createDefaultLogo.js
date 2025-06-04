const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createDefaultLogo() {
    try {
        const svgPath = path.join(__dirname, '../../frontend/public/events/default-tournament-logo.svg');
        const pngPath = path.join(__dirname, '../../frontend/public/events/default-tournament-logo.png');

        // SVG'yi PNG'ye dönüştür
        await sharp(svgPath)
            .resize(200, 200)
            .png()
            .toFile(pngPath);

        console.log('Varsayılan logo oluşturuldu!');
    } catch (error) {
        console.error('Varsayılan logo oluşturulurken hata:', error);
    }
}

createDefaultLogo(); 