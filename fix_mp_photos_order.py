#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix MP photo order - map photos correctly to MPs
"""

import os
import sys
import json
from pathlib import Path
from PIL import Image
import shutil
import re

# تفعيل دعم UTF-8 في Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# المسارات
TEMP_PHOTOS_DIR = Path("temp_mp_photos")
TARGET_DIR = Path("public/images/mps")
DIST_DIR = Path("dist/images/mps")
MPS_JSON = Path("public/data/mps.json")

def extract_number(filename):
    """استخراج الرقم من اسم الملف"""
    match = re.search(r'image(\d+)', filename)
    if match:
        return int(match.group(1))
    return 0

def find_all_images():
    """البحث عن جميع الصور مع الترتيب الصحيح"""
    # البحث عن المجلد الفرعي
    subdirs = [d for d in TEMP_PHOTOS_DIR.iterdir() if d.is_dir()]
    
    if subdirs:
        # البحث عن مجلد images داخل المجلد الفرعي
        search_dir = subdirs[0] / "images"
        if not search_dir.exists():
            # إذا لم يوجد مجلد images، استخدم المجلد الفرعي مباشرة
            search_dir = subdirs[0]
        print(f"[*] استخدام المجلد للصور")
    else:
        search_dir = TEMP_PHOTOS_DIR
    
    images = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
        # بحث مباشر في المجلد (بدون rglob لتجنب التكرار)
        found = list(search_dir.glob(ext))
        images.extend(found)
    
    # ترتيب حسب الرقم في اسم الملف
    images_with_numbers = [(img, extract_number(img.name)) for img in images]
    images_with_numbers.sort(key=lambda x: x[1])
    
    return [img for img, _ in images_with_numbers]

def convert_to_jpg(image_path, output_path, quality=85):
    """تحويل الصورة إلى JPG"""
    with Image.open(image_path) as img:
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        img.save(output_path, 'JPEG', quality=quality, optimize=True)
        return output_path

def main():
    print("=" * 60)
    print("         إصلاح ترتيب صور النواب")
    print("=" * 60)
    
    # 1. البحث عن الصور مع الترتيب الصحيح
    print("\n[*] البحث عن الصور وترتيبها...")
    images = find_all_images()
    print(f"[+] وجدت {len(images)} صورة")
    
    if len(images) == 0:
        print("[!] لم يتم العثور على أي صور!")
        return
    
    # عرض أول 10 صور للتحقق
    print("\n[*] أول 10 صور بالترتيب الصحيح:")
    for i, img in enumerate(images[:10], 1):
        print(f"   {i}. {img.name}")
    
    # 2. قراءة بيانات النواب
    print("\n[*] قراءة بيانات النواب...")
    with open(MPS_JSON, 'r', encoding='utf-8') as f:
        mps_data = json.load(f)
    print(f"[+] وجدت {len(mps_data)} نائب")
    
    if len(images) != len(mps_data):
        print(f"[!] تحذير: عدد الصور ({len(images)}) لا يطابق عدد النواب ({len(mps_data)})")
        return
    
    # 3. معالجة ونقل الصور بالترتيب الصحيح
    print("\n[*] معالجة ونقل الصور بالترتيب الصحيح...")
    processed = 0
    errors = []
    
    for idx, img_path in enumerate(images, 1):
        try:
            # اسم الملف الجديد
            target_name = f"mp_{idx:03d}.jpg"
            target_path = TARGET_DIR / target_name
            dist_path = DIST_DIR / target_name
            
            # المعالجة
            if img_path.suffix.lower() in ['.png']:
                # تحويل PNG إلى JPG
                convert_to_jpg(img_path, target_path)
                if DIST_DIR.exists():
                    shutil.copy2(target_path, dist_path)
                print(f"   [+] [{idx}/{len(images)}] {img.name} -> {target_name} (PNG->JPG)")
            else:
                # نسخ JPG مباشرة
                shutil.copy2(img_path, target_path)
                if DIST_DIR.exists():
                    shutil.copy2(img_path, dist_path)
                print(f"   [+] [{idx}/{len(images)}] {img_path.name} -> {target_name}")
            
            # عرض اسم النائب المقابل
            mp_name = mps_data[idx-1]['fullName']
            print(f"       -> {mp_name}")
            
            processed += 1
            
        except Exception as e:
            error_msg = f"خطأ في معالجة {img_path.name}: {e}"
            errors.append(error_msg)
            print(f"   [X] {error_msg}")
    
    # 4. النتائج
    print("\n" + "=" * 60)
    print("                        النتائج")
    print("=" * 60)
    print(f"[+] تم معالجة: {processed} صورة")
    
    if errors:
        print(f"\n[X] أخطاء ({len(errors)}):")
        for error in errors:
            print(f"   - {error}")
    else:
        print("\n[SUCCESS] تم إصلاح ترتيب جميع الصور بنجاح!")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
