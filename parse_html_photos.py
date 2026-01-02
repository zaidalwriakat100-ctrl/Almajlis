#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Parse MPs pics HTML file to get correct photo-to-MP mapping
"""

import os
import sys
import json
import re
from pathlib import Path
from PIL import Image
import shutil
from bs4 import BeautifulSoup

# تفعيل دعم UTF-8 في Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# المسارات
HTML_FILE = Path("temp_mp_photos/MPs pics.ht_")
IMAGES_DIR = Path("temp_mp_photos")
TARGET_DIR = Path("public/images/mps")
DIST_DIR = Path("dist/images/mps")
MPS_JSON = Path("public/data/mps.json")

def parse_html_for_mp_images():
    """تحليل ملف HTML للحصول على ترتيب الصور"""
    print("[*] قراءة ملف HTML...")
    
    with open(HTML_FILE, 'r', encoding='windows-1256') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # البحث عن جميع أسماء النواب والصور المرتبطة بهم
    mp_image_mapping = []
    
    # البحث عن كل عنصر يحتوي على اسم النائب (h1 أو h2 أو h3)
    for heading in soup.find_all(['h1', 'h2', 'h3', 'p']):
        text = heading.get_text().strip()
        
        # تحقق إذا كان النص يحتوي على "سعادة" أو "معالي" (دلالة على اسم نائب)
        if 'سعادة' in text or 'معالي' in text:
            # البحث عن الصورة التالية
            next_elem = heading.find_next('img')
            if next_elem and 'id' in next_elem.attrs:
                image_id = next_elem['id']
                mp_name = text
                mp_image_mapping.append({
                    'name': mp_name,
                    'image_id': image_id,
                    'src': next_elem.get('src', '')
                })
                print(f"   [{len(mp_image_mapping)}] {mp_name} -> {image_id}")
    
    return mp_image_mapping

def extract_number_from_image_id(image_id):
    """استخراج الرقم من معرف الصورة"""
    match = re.search(r'image(\d+)', image_id)
    if match:
        return int(match.group(1))
    return 0

def find_image_file(image_id):
    """البحث عن ملف الصورة في المجلدات"""
    # البحث في جميع المجلدات الفرعية
    for root, dirs, files in os.walk(IMAGES_DIR):
        for file in files:
            if image_id.lower() in file.lower():
                return Path(root) / file
    
    # البحث بالرقم
    num = extract_number_from_image_id(image_id)
    if num > 0:
        for ext in ['.jpg', '.png', '.gif', '.jpeg', '.JPG', '.PNG', '.GIF', '.JPEG']:
            pattern = f"image{num}{ext}"
            for root, dirs, files in os.walk(IMAGES_DIR):
                for file in files:
                    if file.lower() == pattern.lower():
                        return Path(root) / file
    
    return None

def convert_to_jpg(image_path, output_path, quality=85):
    """تحويل الصورة إلى JPG"""
    with Image.open(image_path) as img:
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            if img.mode in ('RGBA', 'LA'):
                background.paste(img, mask=img.split()[-1])
            else:
                background.paste(img)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        img.save(output_path, 'JPEG', quality=quality, optimize=True)

def main():
    print("=" * 60)
    print("     تحديث صور النواب من ملف HTML")
    print("=" * 60)
    
    # 1. تحليل HTML
    mp_mappings = parse_html_for_mp_images()
    print(f"\n[+] وجدت {len(mp_mappings)} نائب في ملف HTML")
    
    if not mp_mappings:
        print("[!] لم يتم العثور على أي تطابق!")
        return
    
    # 2. قراءة بيانات النواب من JSON
    print("\n[*] قراءة بيانات النواب من mps.json...")
    with open(MPS_JSON, 'r', encoding='utf-8') as f:
        mps_data = json.load(f)
    print(f"[+] وجدت {len(mps_data)} نائب في البيانات")
    
    # 3. معالجة ونقل الصور
    print("\n[*] معالجة ونقل الصور بالترتيب الصحيح...")
    processed = 0
    errors = []
    
    for idx, mapping in enumerate(mp_mappings, 1):
        try:
            # البحث عن ملف الصورة
            image_file = find_image_file(mapping['image_id'])
            
            if not image_file:
                error_msg = f"لم يتم العثور على صورة: {mapping['image_id']}"
                errors.append(error_msg)
                print(f"   [X] [{idx}/{len(mp_mappings)}] {error_msg}")
                continue
            
            # اسم الملف الجديد
            target_name = f"mp_{idx:03d}.jpg"
            target_path = TARGET_DIR / target_name
            dist_path = DIST_DIR / target_name
            
            # المعالجة
            if image_file.suffix.lower() in ['.png', '.gif']:
                convert_to_jpg(image_file, target_path)
                if DIST_DIR.exists():
                    shutil.copy2(target_path, dist_path)
                print(f"   [+] [{idx}/{len(mp_mappings)}] {image_file.name} -> {target_name} (محول)")
            else:
                shutil.copy2(image_file, target_path)
                if DIST_DIR.exists():
                    shutil.copy2(target_path, dist_path)
                print(f"   [+] [{idx}/{len(mp_mappings)}] {image_file.name} -> {target_name}")
            
            # عرض اسم النائب من HTML
            print(f"       -> {mapping['name']}")
            
            if idx <= len(mps_data):
                json_name = mps_data[idx-1]['fullName']
                if json_name not in mapping['name']:
                    print(f"       [!] تحذير: اسم مختلف في JSON: {json_name}")
            
            processed += 1
            
        except Exception as e:
            error_msg = f"خطأ في معالجة {mapping.get('image_id', 'unknown')}: {e}"
            errors.append(error_msg)
            print(f"   [X] {error_msg}")
    
    # 4. النتائج
    print("\n" + "=" * 60)
    print("                        النتائج")
    print("=" * 60)
    print(f"[+] تم معالجة: {processed} صورة")
    
    if errors:
        print(f"\n[!] أخطاء ({len(errors)}):")
        for error in errors[:10]:  # عرض أول 10 أخطاء فقط
            print(f"   - {error}")
    
    if processed == len(mps_data):
        print("\n[SUCCESS] تم إصلاح ترتيب جميع الصور بنجاح!")
    else:
        print(f"\n[!] تحذير: تم معالجة {processed} من أصل {len(mps_data)} نائب")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
