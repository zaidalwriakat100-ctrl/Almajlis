#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Restore correct bloc memberships based on user-provided list
Match by MP name and assign to correct bloc
"""

import json
import re

def load_mps():
    with open('public/data/mps.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_mps(mps):
    with open('public/data/mps.json', 'w', encoding='utf-8') as f:
        json.dump(mps, f, ensure_ascii=False, indent=2)

def normalize_name(name):
    """Normalize name for matching"""
    # Remove extra spaces
    name = ' '.join(name.split())
    # Remove common prefixes
    name = name.replace('سعادة السيد', '').replace('سعادة النائب', '').strip()
    return name

# Correct bloc memberships from user
CORRECT_BLOCS = {
    "كتلة اتحاد الأحزاب الوسطية والوطني الإسلامي": [
        "إبراهيم صقر سليمان القرالة",
        "آية الله محمد علي الفريحات",
        "أيمن عودة محمد البدادوة",
        "جميل أحمد محمد الدهيسات",
        "جمال عيسى جريس قموه",
        "جهاد عبد المجيد خميس عبوي",
        "خالد علي محمد المسامره العقيلات",
        "رانيا منصور عواد أبو رمان",
        "رائد مصباح طلب رباع",
        "زهير محمد زهير الخشمان",
        "محمد سلامة عبدالله السبايلة",
        "محمد عبدالرزاق عيد الرعود",
        "محمد قاسم سليمان المراعية",
        "مصطفى صالح مصطفى العماوي",
        "معتز محمد موسى أبو رمان",
        "ميسون صبحي محمد القوابعة",
        "نجمه شفيق خايف الهواوشه",
        "نمر عبدالحميد عبدالله الفقهاء العبادي",
        "هاله يوسف محمود الجراح",
        "سليمان حويلة عيد الزبن",
        "سليمان عبد العزيز سليمان السعود",
        "محمد أحمد علي الجراح",
        "قاسم عبدالله محمد القباعي",
        "علي سليمان محمد الغزاوي",
        "عطالله علي قاضي الحنيطي",
        "عبدالرحمن حسين محمد العوايشه"
    ],
    "كتلة حزب مبادرة النيابية": [
        "أحمد إبراهيم سلامه الهميسات",
        "أحمد حسن موسى الشديفات",
        "آمال ضيف الله سليم الشقران",
        "بكر محمد عبدالغني الحيصة",
        "بدر عواد رجا الحراحشة",
        "حسين علي محمود العموش",
        "حمود إبراهيم أحمد الزواهره",
        "خالد موسى عيسى أبو حسان",
        "خميس حسين خليل عطية",
        "دينا عوني محمد البشير",
        "محمد عبد الفتاح محمود هديب",
        "محمد عبدالله علي البستنجي",
        "مصطفى فؤاد محمد الخصاونة",
        "نسيم عارف إبراهيم العبادي",
        "سامر نوفان فضيل العبابسه",
        "شفاء عيسى محمد صوان",
        "طارق عبد المهدي عبدالله بني هاني",
        "محمد أحمد عبدالدايم المحاميد",
        "فريال يوسف أحمد بني سلمان",
        "فراس محمد خليف القبلان",
        "عيسى مخائيل سلامة نصار",
        "عبدالهادي سليمان ثاني البريزات",
        "رند جهاد فؤاد الخزوز"
    ],
    "كتلة جبهة العمل الإسلامي": [
        "إبراهيم صالح هلال الحميدي",
        "أحمد إبراهيم عبدالعزيز القطاونه",
        "أحمد سليمان عوض الرقب",
        "إيمان محمد أمين إسحق العباسي",
        "أيمن توفيق يوسف أبو الرب",
        "باسم مرشد صالح الروابده",
        "بيان فخري عيسى المحسيري",
        "جهاد زهير سالم المدانات",
        "حامد خليل رشيد الرحامنة",
        "حسن صلاح صالح الرياطي",
        "خضر هليل مطير بني خالد",
        "راكين خلف محمد أبو هنية",
        "رائد طاهر حمدان القطامين",
        "محمد خليل محمد عقل",
        "معتز علي سالم الهروط",
        "موسى علي محمد الوحش",
        "ناصر سلامه عقلة نواصره",
        "هدى حسين محمد عتوم",
        "وسام محمد عبدالغني الربيحات",
        "ينال عبدالسلام نورالدين الفريحات",
        "سالم علي محمود أبو دولة",
        "صالح عبدالكريم شحاده العرموطي",
        "مالك عبدالله علي الطهراوي",
        "لبنى محمد بكر النمور",
        "فتحي يوسف سلمان البوات",
        "علي محمود محمد الخزعلي",
        "عدنان يلدار الخاص مشوقه",
        "حياه حسين علي مسيمي",
        "ديمه محمد طارق عبد الرحيم طهبوب",
        "نور حسني أحمد أبوغوش",
        "نبيل كامل أحمد الشيشاني"
    ],
    "كتلة حزب عزم": [
        "وليد حامد صالح المصري",
        "تيسير سالم داود أبو عرابي العدوان",
        "مؤيد فضيل محمد العلاونة",
        "سالم حسني سالم العمري",
        "إبراهيم سلامه محمود الصرايره",
        "إبراهيم فنخير سالم الجبور",
        "أروى علي حمد الزبون",
        "آيات محمد أحمد بني عيسى",
        "إياد يعقوب سعيد جبرين",
        "أيمن محمود عبدالله أبو هنية",
        "حسين خالد حسين الطراونة",
        "خليفة سليمان محمد الديات",
        "محمد زكي محمد بني ملحم",
        "محمد سلامة عطالله الغويري",
        "مي محمد علي السردية",
        "هدى إبراهيم نصار نفاع",
        "صالح ساري محمد أبو تايه",
        "محمد جميل محمد الظهراوي",
        "محمد أحمد خليف المرايات",
        "وصفي هلال عبدالله حداد"
    ],
    "كتلة حزب الميثاق الوطني": [
        "إبراهيم يوسف صالح الطراونة",
        "إسلام لويفي عيدالاتيم العزازمة",
        "حكم منصور ظاهر المعادات",
        "عمر عواد فليح بني خالد",
        "أحمد جميل عبدالقادر عشا",
        "أحمد حمدان ندى العليمات",
        "أحمد عبدالعزيز أحمد السراحنه",
        "أحمد محمد علي الصفدي",
        "أندريه مراد محمود عبدالجليل حواري",
        "حابس ركاد خليف الشبيب",
        "حابس سامي مثقال الفايز",
        "حسين سعود عوض مرعي كريشان",
        "حمزة محمد محمود الحوامدة",
        "رانية محمد حسن الخليفات",
        "محمد يحيا محمد المحارمه",
        "مي محمود علي حراحشة",
        "نصار حسن سالم القيسي",
        "هايل فريح جريس عياش",
        "هيثم جريس عوده الزيادين",
        "يوسف محمد هارون الرواضيه",
        "سليمان حمدان سالم الخرابشة",
        "شاهر سعد صالح الشطناوي",
        "طلال محمد عبدالوالي النسور",
        "عارف منور عبدالرحمن السعايده العبادي",
        "عبدالباسط عبدالله سعيد الكباريتي",
        "مجحم حمد حسين الصقور",
        "مازن تركي سعود القاضي",
        "فليحه سلامه مقبول السبيتان",
        "عوني علي طلال الزعبي",
        "علي سالم فاضل الخلايله",
        "عثمان عبدالله سليمان المخادمة",
        "عبد الناصر هاشم محمود الخصاونة",
        "عبدالحليم محمد عبدالحليم عنانبة",
        "تمارا يعقوب عادل ناصرالدين",
        "محمد فخري شكري كتاو"
    ],
    "النواب المستقلون": [
        "إسماعيل راشد عبود المشاقبه",
        "محمود خلف حمد النعيمات",
        "عبدالرؤوف عبدالقادر سليمان الربيحات"
    ]
}

def find_mp_by_name(mps, target_name):
    """Find MP by name with fuzzy matching"""
    target_normalized = normalize_name(target_name)
    
    for mp in mps:
        mp_normalized = normalize_name(mp['fullName'])
        
        # Exact match
        if mp_normalized == target_normalized:
            return mp
        
        # Partial match (all words in target are in mp name)
        target_words = set(target_normalized.split())
        mp_words = set(mp_normalized.split())
        if target_words.issubset(mp_words) or mp_words.issubset(target_words):
            return mp
    
    return None

def main():
    print("=== Restoring Correct Bloc Memberships ===\n")
    
    mps = load_mps()
    changes = []
    notfound = []
    
    for bloc_name, member_names in CORRECT_BLOCS.items():
        print(f"\nProcessing: {bloc_name} ({len(member_names)} members)")
        
        for member_name in member_names:
            mp = find_mp_by_name(mps, member_name)
            
            if mp:
                # Update ordinary_2 bloc
                if mp.get('memberships'):
                    for membership in mp['memberships']:
                        if membership['session'] == 'ordinary_2':
                            old_bloc = membership.get('bloc', '')
                            if old_bloc != bloc_name:
                                membership['bloc'] = bloc_name
                                changes.append(f"{mp['id']}: {old_bloc} -> {bloc_name}")
                            break
            else:
                notfound.append(member_name)
                print(f"  [NOT FOUND] {member_name}")
    
    # Save changes
    save_mps(mps)
    
    print(f"\n=== Results ===")
    print(f"Total changes: {len(changes)}")
    print(f"Not found: {len(notfound)}")
    
    if notfound:
        print("\nMPs not found in database:")
        for name in notfound[:10]:
            print(f"  - {name}")
    
    # Verify
    from collections import Counter
    blocs = []
    for mp in mps:
        if mp.get('memberships'):
            for mem in mp['memberships']:
                if mem['session'] == 'ordinary_2':
                    blocs.append(mem.get('bloc', 'Unknown'))
                    break
    
    counts = Counter(blocs)
    
    print("\n=== Final Verification ===")
    expected = {
        "كتلة اتحاد الأحزاب الوسطية والوطني الإسلامي": 26,
        "كتلة حزب مبادرة النيابية": 23,
        "كتلة جبهة العمل الإسلامي": 31,
        "كتلة حزب عزم": 20,
        "كتلة حزب الميثاق الوطني": 35,
        "النواب المستقلون": 3
    }
    
    all_correct = True
    for bloc, exp in expected.items():
        actual = counts.get(bloc, 0)
        status = "OK" if actual == exp else "WRONG"
        print(f"[{status}] {bloc[:40]}: {actual}/{exp}")
        if status != "OK":
            all_correct = False
    
    if all_correct:
        print("\n[SUCCESS] All blocs restored correctly!")
    else:
        print("\n[WARNING] Some mismatches remain")

if __name__ == '__main__':
    main()
