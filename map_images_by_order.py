#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Map MP photos from MPs pics_files directory in ORDER
Uses numbered images (image001.jpg, image002.jpg, etc.) and maps them to MPs in order
"""

import os
import sys
import json
import shutil
from pathlib import Path
from PIL import Image

# تفعيل دعم UTF-8 في Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# المسارات
SOURCE_DIR = Path("temp_mp_photos/MPs pics_files")
TARGET_DIR = Path("public/images/mps")
DIST_DIR = Path("dist/images/mps")
MPS_JSON = Path("public/data/mps.json")

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
    print("     تحديث صور النواب حسب الترتيب")
    print("=" * 60)
    
    # 1. قراءة بيانات النواب من JSON
    print("\n[*] قراءة بيانات النواب من mps.json...")
    with open(MPS_JSON, 'r', encoding='utf-8') as f:
        mps_data = json.load(f)
    print(f"[+] وجدت {len(mps_data)} نائب في البيانات")
    
    # 2. إنشاء المجلدات إذا لم تكن موجودة
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    if not DIST_DIR.exists():
        DIST_DIR.mkdir(parents=True, exist_ok=True)
    
    # 3. معالجة الصور بالترتيب
    print("\n[*] معالجة ونقل الصور بالترتيب...")
    processed = 0
    errors = []
    
    for idx in range(1, len(mps_data) + 1):
        try:
            # البحث عن الصورة بالرقم
            source_image = None
            for ext in ['.jpg', '.gif', '.png', '.jpeg', '.JPG', '.GIF', '.PNG', '.JPEG']:
                # تنسيق الرقم مع أصفار (001, 002, etc.)
                image_name = f"image{idx:03d}{ext}"
                image_path = SOURCE_DIR / image_name
                if image_path.exists():
                    source_image = image_path
                    break
            
            if not source_image:
                error_msg = f"لم يتم العثور على صورة رقم {idx}"
                errors.append(error_msg)
                print(f"   [X] [{idx}/{len(mps_data)}] {error_msg}")
                continue
            
            # اسم الملف الهدف
            target_name = f"mp_{idx:03d}.jpg"
            target_path = TARGET_DIR / target_name
            dist_path = DIST_DIR / target_name
            
            # المعالجة
            if source_image.suffix.lower() in ['.png', '.gif']:
                convert_to_jpg(source_image, target_path)
                if DIST_DIR.exists():
                    shutil.copy2(target_path, dist_path)
                print(f"   [+] [{idx}/{len(mps_data)}] {source_image.name} -> {target_name} (محول)")
            else:
                shutil.copy2(source_image, target_path)
                if DIST_DIR.exists():
                    shutil.copy2(target_path, dist_path)
                print(f"   [+] [{idx}/{len(mps_data)}] {source_image.name} -> {target_name}")
            
            # عرض اسم النائب
            mp_name = mps_data[idx-1]['fullName']
            print(f"       -> {mp_name}")
            
            processed += 1
            
        except Exception as e:
            error_msg = f"خطأ في معالجة الصورة رقم {idx}: {e}"
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
