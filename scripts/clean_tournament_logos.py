import os
from pathlib import Path
import shutil
import re

def clean_filename(filename):
    # Dosya adından uzantıyı ayır
    name, ext = os.path.splitext(filename)
    
    # Özel karakterleri temizle ve küçük harfe çevir
    cleaned = re.sub(r'[^a-zA-Z0-9]', '_', name.lower())
    
    # Birden fazla alt çizgiyi tek alt çizgiye dönüştür
    cleaned = re.sub(r'_+', '_', cleaned)
    
    # Baştaki ve sondaki alt çizgileri kaldır
    cleaned = cleaned.strip('_')
    
    return f"{cleaned}{ext}"

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