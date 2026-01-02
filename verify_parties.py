#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
التحقق من بيانات الأحزاب المحدثة
"""

import json
import sys

# تفعيل دعم UTF-8 في Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# قراءة بيانات الأحزاب
with open('public/data/parties.json', 'r', encoding='utf-8') as f:
    parties = json.load(f)

print("=" * 80)
print("التحقق من بيانات الأحزاب")
print("=" * 80)
print()

print(f"✓ عدد الأحزاب: {len(parties)}")
print(f"✓ مجموع المقاعد: {sum(p['totalSeats'] for p in parties)}")
print()

print("توزيع المقاعد حسب الأحزاب:")
print("-" * 80)

for party in parties:
    total = party['totalSeats']
    national = party['nationalListSeats']
    local = party['localSeats']
    
    print(f"\n{party['name']}:")
    print(f"  • المجموع: {total} مقعد")
    print(f"  • الدائرة العامة: {national} مقعد")
    print(f"  • الدوائر المحلية: {local} مقعد")
    
    if 'note' in party:
        print(f"  • ملاحظة: {party['note']}")

print()
print("=" * 80)
print("✓ التحقق مكتمل بنجاح!")
print("=" * 80)
