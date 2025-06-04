const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const savePath = 'C:/Users/gs_me/Desktop/Yeni klasör (2)/esportspulse/frontend/public/events';

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Resim alınamadı: ${res.statusCode}`));
      }

      const fileStream = fs.createWriteStream(filepath);
      res.pipe(fileStream);
      fileStream.on('finish', () => fileStream.close(resolve));
    }).on('error', reject);
  });
}

async function scrapeAllEventLogos() {
  console.log("Etkinlik sayfası açılıyor...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let pageNum = 1;
  let totalDownloaded = 0;

  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  while (true) {
    const url = `https://www.vlr.gg/events/?page=${pageNum}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    const events = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.event-item'));
      return rows.map(row => {
        const name = row.querySelector('.event-item-title')?.innerText.trim() || 'unknown';
        const img = row.querySelector('img')?.getAttribute('src') || '';
        return {
          name,
          logo: img,
        };
      });
    });

    if (events.length === 0) {
      console.log(`✅ ${pageNum - 1}. sayfadan sonra veri kalmadı. Toplam indirilen: ${totalDownloaded}`);
      break;
    }

    console.log(`📄 Sayfa ${pageNum}: ${events.length} etkinlik bulundu.`);

    for (const event of events) {
      const logoUrl = event.logo.startsWith('//') ? 'https:' + event.logo : event.logo;

      // Geçersiz URL'leri atla
      if (!logoUrl.startsWith('http')) {
        console.warn(`⚠️ Atlandı (geçersiz URL): ${event.name}`);
        continue;
      }

      const safeName = event.name.replace(/[<>:"\/\\|?*]+/g, '-');
      const ext = path.extname(new URL(logoUrl).pathname) || '.png';
      const filename = `${safeName}${ext}`;
      const filepath = path.join(savePath, filename);

      if (fs.existsSync(filepath)) {
        console.log(`↪️ Zaten var: ${filename}`);
        continue;
      }

      console.log(`⬇️ İndiriliyor: ${filename}`);
      try {
        await downloadImage(logoUrl, filepath);
        totalDownloaded++;
      } catch (err) {
        console.error(`❌ Hata indirirken: ${filename}`, err.message);
      }
    }

    pageNum++;
  }

  await browser.close();
  console.log("🎉 İşlem tamamlandı.");
}

scrapeAllEventLogos();
