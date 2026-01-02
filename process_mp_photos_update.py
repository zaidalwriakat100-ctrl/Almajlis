#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
سكريبت لمعالجة وتحديث صور النواب
- يفحص الصور الجديدة في temp_mp_photos
- يحول كل الصور إلى JPG
- يتحقق من عدم وجود تكرار
- ينقل الصور إلى public/images/mps/
"""

import os
import sys
import json
from pathlib import Path
from PIL import Image
import hashlib
import shutil

# تفعيل دعم UTF-8 في Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')


# المسارات
TEMP_PHOTOS_DIR = Path("temp_mp_photos")
TARGET_DIR = Path("public/images/mps")
BACKUP_DIR = Path("backup_mp_photos")
MPS_JSON = Path("public/data/mps.json")

def get_image_hash(image_path):
    """حساب hash للصورة للكشف عن التكرار"""
    with Image.open(image_path) as img:
        # تحويل الصورة إلى صيغة ثابتة للمقارنة
        img = img.convert('RGB')
        img = img.resize((100, 100))  # تصغير للسرعة
        return hashlib.md5(img.tobytes()).hexdigest()

def find_all_images():
    """البحث عن جميع الصور في المجلد المؤقت"""
    images = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
        images.extend(TEMP_PHOTOS_DIR.rglob(ext))
    return sorted(images)

def convert_to_jpg(image_path, output_path, quality=85):
    """تحويل الصورة إلى JPG مع ضغط مناسب"""
    with Image.open(image_path) as img:
        # تحويل إلى RGB إذا كانت PNG مع شفافية
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # حفظ كـ JPG
        img.save(output_path, 'JPEG', quality=quality, optimize=True)
        return output_path

def main():
    print("=" * 60)
    print("         تحديث صور النواب - Jordan Parliament Monitor")
    print("=" * 60)
    
    # 1. البحث عن الصور
    print("\n[*] البحث عن الصور في المجلد المؤقت...")
    images = find_all_images()
    print(f"[+] وجدت {len(images)} صورة")
    
    if len(images) == 0:
        print("[!] لم يتم العثور على أي صور!")
        return
    
    # 2. عرض معلومات الصور
    print("\n[*] معلومات الصور:")
    total_size = sum(img.stat().st_size for img in images)
    print(f"   - عدد الصور: {len(images)}")
    print(f"   - الحجم الكلي: {total_size / 1024 / 1024:.2f} MB")
    
    # تصنيف حسب الامتداد
    extensions = {}
    for img in images:
        ext = img.suffix.lower()
        extensions[ext] = extensions.get(ext, 0) + 1
    print(f"   - الامتدادات: {extensions}")
    
    # 3. فحص التكرار
    print("\n[*] فحص التكرار...")
    hashes = {}
    duplicates = []
    
    for img in images:
        try:
            img_hash = get_image_hash(img)
            if img_hash in hashes:
                duplicates.append((img, hashes[img_hash]))
                print(f"   [!] تكرار: {img.name} مطابقة لـ {hashes[img_hash].name}")
            else:
                hashes[img_hash] = img
        except Exception as e:
            print(f"   [X] خطأ في فحص {img.name}: {e}")
    
    if duplicates:
        print(f"\n[!] وجدت {len(duplicates)} صورة مكررة")
    else:
        print("[+] لا يوجد تكرار")
    
    unique_images = list(hashes.values())
    print(f"\n[*] عدد الصور الفريدة: {len(unique_images)}")
    
    # 4. قراءة بيانات النواب
    print("\n[*] قراءة بيانات النواب من mps.json...")
    with open(MPS_JSON, 'r', encoding='utf-8') as f:
        mps_data = json.load(f)
    print(f"[+] وجدت {len(mps_data)} نائب في البيانات")
    
    # 5. التحقق من التطابق
    if len(unique_images) != len(mps_data):
        print(f"\n[!] تحذير: عدد الصور ({len(unique_images)}) لا يطابق عدد النواب ({len(mps_data)})")
        if len(unique_images) > len(mps_data):
            print(f"   هناك {len(unique_images) - len(mps_data)} صورة زيادة")
        else:
            print(f"   هناك {len(mps_data) - len(unique_images)} صورة ناقصة")
    
    # 6. إنشاء نسخة احتياطية
    print("\n[*] إنشاء نسخة احتياطية من الصور الحالية...")
    if TARGET_DIR.exists():
        if BACKUP_DIR.exists():
            shutil.rmtree(BACKUP_DIR)
        shutil.copytree(TARGET_DIR, BACKUP_DIR)
        print(f"[+] تم النسخ الاحتياطي إلى {BACKUP_DIR}")
    else:
        TARGET_DIR.mkdir(parents=True, exist_ok=True)
        print("[+] تم إنشاء مجلد الصور")
    
    # 7. معالجة ونقل الصور
    print("\n[*] معالجة ونقل الصور...")

    processed = 0
    errors = []
    
    # ترتيب الصور حسب الاسم
    sorted_images = sorted(unique_images, key=lambda x: x.name)
    
    for idx, img_path in enumerate(sorted_images, 1):
        try:
            # اسم الملف الجديد
            target_name = f"mp_{idx:03d}.jpg"
            target_path = TARGET_DIR / target_name
            
            # تحويل ونقل
            if img_path.suffix.lower() in ['.png']:
                convert_to_jpg(img_path, target_path)
                print(f"   [+] [{idx}/{len(sorted_images)}] {img_path.name} -> {target_name} (تم التحويل)")
            else:
                # نسخ مباشر للـ JPG
                shutil.copy2(img_path, target_path)
                print(f"   [+] [{idx}/{len(sorted_images)}] {img_path.name} -> {target_name}")
            
            processed += 1
            
        except Exception as e:
            error_msg = f"خطأ في معالجة {img_path.name}: {e}"
            errors.append(error_msg)
            print(f"   [X] {error_msg}")
    
    # 8. النتائج النهائية
    print("\n" + "=" * 60)
    print("                        النتائج النهائية")
    print("=" * 60)
    print(f"[+] تم معالجة: {processed} صورة")
    print(f"[+] تم الحفظ في: {TARGET_DIR}")
    
    if duplicates:
        print(f"[!] صور مكررة تم تجاهلها: {len(duplicates)}")
    
    if errors:
        print(f"\n[X] أخطاء ({len(errors)}):")
        for error in errors:
            print(f"   - {error}")
    
    # 9. فحص نهائي
    print("\n[*] فحص نهائي...")
    final_count = len(list(TARGET_DIR.glob("mp_*.jpg")))
    print(f"   - عدد الصور في المجلد النهائي: {final_count}")
    print(f"   - عدد النواب في البيانات: {len(mps_data)}")
    
    if final_count == len(mps_data):
        print("\n[SUCCESS] تم التحديث بنجاح! جميع النواب لديهم صور.")
    else:
        print(f"\n[!] تحذير: عدم تطابق - {abs(final_count - len(mps_data))} صورة {'زيادة' if final_count > len(mps_data) else 'ناقصة'}")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
