#!/usr/bin/env python3
"""
YKS Akıllı Asistanı PWA İkon Üretici
Tüm PWA için gerekli ikon boyutlarını üretir
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    """PWA ikonu oluştur"""
    
    # Yeni image oluştur
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Gradyan arka plan
    for i in range(size):
        for j in range(size):
            # Merkez nokta
            center_x, center_y = size // 2, size // 2
            distance = ((i - center_x) ** 2 + (j - center_y) ** 2) ** 0.5
            max_distance = (center_x ** 2 + center_y ** 2) ** 0.5
            
            # Gradyan hesaplama
            ratio = distance / max_distance
            
            # Mor tonları
            r = int(124 + (76 - 124) * ratio)  # 124 -> 76
            g = int(58 + (175 - 58) * ratio)   # 58 -> 175  
            b = int(237 + (80 - 237) * ratio)  # 237 -> 80
            
            img.putpixel((i, j), (r, g, b, 255))
    
    # Yuvarlak köşeler (maskable için)
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse((0, 0, size, size), fill=255)
    
    # Maske uygula
    img.putalpha(mask)
    
    # Beyin emoji ekleme (Unicode)
    try:
        # Font boyutunu ikon boyutuna göre ayarla
        font_size = size // 2
        
        # Sistem fontunu dene
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
            except:
                font = ImageFont.load_default()
        
        # Beyin emoji
        emoji = "🧠"
        
        # Text boyutunu al
        bbox = draw.textbbox((0, 0), emoji, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Merkeze yerleştir
        x = (size - text_width) // 2
        y = (size - text_height) // 2
        
        # Beyaz gölge efekti
        for offset in [(1, 1), (-1, -1), (1, -1), (-1, 1)]:
            draw.text((x + offset[0], y + offset[1]), emoji, font=font, fill=(255, 255, 255, 100))
        
        # Ana text
        draw.text((x, y), emoji, font=font, fill=(255, 255, 255, 255))
        
    except Exception as e:
        print(f"Emoji ekleme hatası: {e}")
        # Fallback: Basit text
        draw.text((size//4, size//4), "AI", font=font, fill=(255, 255, 255, 255))
    
    # Kaydet
    img.save(filename, 'PNG', optimize=True)
    print(f"✅ {filename} oluşturuldu ({size}x{size})")

def create_favicon():
    """Favicon oluştur"""
    # 32x32 favicon
    img = Image.new('RGBA', (32, 32), (124, 58, 237, 255))
    draw = ImageDraw.Draw(img)
    
    # Küçük beyin emoji
    try:
        font = ImageFont.load_default()
        draw.text((8, 8), "🧠", font=font, fill=(255, 255, 255, 255))
    except:
        # Fallback
        draw.ellipse((8, 8, 24, 24), fill=(255, 255, 255, 255))
        draw.text((12, 10), "AI", fill=(124, 58, 237, 255))
    
    img.save('favicon.ico', format='ICO', sizes=[(32, 32)])
    print("✅ favicon.ico oluşturuldu")

def main():
    """Ana fonksiyon"""
    
    # İkon boyutları
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    # Her boyut için ikon oluştur
    for size in sizes:
        create_icon(size, f'icon-{size}x{size}.png')
    
    # Apple touch icon (180x180)
    create_icon(180, 'apple-touch-icon.png')
    
    # Badge icon (72x72)
    create_icon(72, 'badge-72x72.png')
    
    # Shortcut icons
    create_icon(96, 'shortcut-plan.png')
    create_icon(96, 'shortcut-stats.png') 
    create_icon(96, 'shortcut-ai.png')
    
    # Favicon
    create_favicon()
    
    print("\n🎉 Tüm PWA ikonları başarıyla oluşturuldu!")
    print("📁 Dosyalar /public/icons/ klasöründe")

if __name__ == "__main__":
    main()
