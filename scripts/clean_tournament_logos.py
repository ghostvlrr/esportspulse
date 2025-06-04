import os
import shutil
import re
from pathlib import Path

def clean_filename(filename):
    # Türkçe karakterleri düzelt
    tr_chars = {
        'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c',
        'İ': 'I', 'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'Ö': 'O', 'Ç': 'C'
    }
    
    # Dosya adı ve uzantıyı ayır
    name, ext = os.path.splitext(filename)
    
    # Türkçe karakterleri değiştir
    for tr_char, eng_char in tr_chars.items():
        name = name.replace(tr_char, eng_char)
    
    # Özel karakterleri ve boşlukları temizle
    name = re.sub(r'[^a-zA-Z0-9-]', '-', name)
    
    # Birden fazla tireyi tek tireye dönüştür
    name = re.sub(r'-+', '-', name)
    
    # Baştaki ve sondaki tireleri kaldır
    name = name.strip('-')
    
    # Küçük harfe çevir
    name = name.lower()
    
    return f"{name}{ext}"

def process_logos():
    # Kaynak ve hedef dizinleri
    source_dir = Path("frontend/public/events")
    processed_dir = source_dir / "processed"
    
    # İşlenmiş dosyalar için dizin oluştur
    processed_dir.mkdir(exist_ok=True)
    
    # Tüm PNG dosyalarını işle
    for file in source_dir.glob("*.png"):
        if file.name == "default-tournament-logo.png":
            continue
            
        # Yeni dosya adını oluştur
        new_name = clean_filename(file.name)
        new_path = processed_dir / new_name
        
        # Dosyayı kopyala ve yeniden adlandır
        shutil.copy2(file, new_path)
        print(f"İşlendi: {file.name} -> {new_name}")

if __name__ == "__main__":
    process_logos() 