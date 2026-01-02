#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Update ordinary_1 (First Ordinary Session) bloc memberships
Based on user-provided data
"""

import json

def load_mps():
    with open('public/data/mps.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_mps(mps):
    with open('public/data/mps.json', 'w', encoding='utf-8') as f:
        json.dump(mps, f, ensure_ascii=False, indent=2)

def normalize_name(name):
    """Normalize name for matching"""
    name = ' '.join(name.split())
    name = name.replace('سعادة السيد', '').replace('سعادة النائب', '').strip()
    return name

# Correct bloc memberships for ordinary_1
ORDINARY_1_BLOCS = {
    "كتلة حزب الميثاق الوطني": [
        "مازن تركي سعود القاضي",
        "عبدالباسط عبدالله سعيد الكباريتي",
        "مي محمود علي حراحشة",
        "حمزة محمد محمود الحوامدة",
        "إبراهيم يوسف صالح الطراونة",
        "أحمد جميل عبدالقادر عشا",
        "أحمد حمدان ندى العليمات",
        "أحمد عبدالعزيز أحمد السراحنه",
        "أحمد محمد علي الصفدي",
        "إسلام لويفي عيدالاتيم العزازمة",
        "أندريه مراد محمود عبدالجليل حواري",
        "حابس ركاد خليف الشبيب",
        "حابس سامي مثقال الفايز",
        "حسين سعود عوض مرعي كريشان",
        "رانية محمد حسن الخليفات",
        "محمد يحيا محمد المحارمه",
        "محمود خلف حمد النعيمات",
        "نصار حسن سالم القيسي",
        "هايل فريح جريس عياش",
        "هيثم جريس عوده الزيادين",
        "يوسف محمد هارون الرواضيه",
        "سليمان حمدان سالم الخرابشة",
        "شاهر سعد صالح الشطناوي",
        "طلال محمد عبدالوالي النسور",
        "عارف منور عبدالرحمن السعايده العبادي",
        "مجحم حمد حسين الصقور",
        "فليحه سلامه مقبول السبيتان",
        "عوني علي طلال الزعبي",
        "عمر عواد فليح بني خالد",
        "علي سالم فاضل الخلايله",
        "عثمان عبدالله سليمان المخادمة",
        "عبد الناصر هاشم محمود الخصاونة",
        "عبدالحليم محمد عبدالحليم عنانبة",
        "تمارا يعقوب عادل ناصرالدين",
        "محمد فخري شكري كتاو"
    ],
    "كتلة حزب إرادة والوطني الإسلامي": [
        "خميس حسين خليل عطية",
        "نسيم عارف إبراهيم العبادي",
        "هاله يوسف محمود الجراح",
        "عطالله علي قاضي الحنيطي",
        "أحمد إبراهيم سلامه الهميسات",
        "جميل أحمد محمد الدهيسات",
        "حسين علي محمود العموش",
        "حمود إبراهيم أحمد الزواهره",
        "دينا عوني محمد البشير",
        "محمد سلامة عبدالله السبايلة",
        "محمد عبدالرزاق عيد الرعود",
        "محمد عبدالله علي البستنجي",
        "مصطفى صالح مصطفى العماوي",
        "ميسون صبحي محمد القوابعة",
        "نمر عبدالحميد عبدالله الفقهاء العبادي",
        "شفاء عيسى محمد صوان",
        "طارق عبد المهدي عبدالله بني هاني",
        "محمد أحمد عبدالدايم المحاميد"
    ],
    "كتلة اتحاد الأحزاب الوسطية": [
        "زهير محمد زهير الخشمان",
        "رانيا منصور عواد أبو رمان",
        "إبراهيم صقر سليمان القرالة",
        "قاسم عبدالله محمد القباعي",
        "أيمن عودة محمد البدادوة",
        "جمال عيسى جريس قموه",
        "جهاد عبد المجيد خميس عبوي",
        "حكم منصور ظاهر المعادات",
        "خالد علي محمد المسامره العقيلات",
        "محمد قاسم سليمان المراعية",
        "معتز محمد موسى أبو رمان",
        "سليمان حويلة عيد الزبن",
        "سليمان عبد العزيز سليمان السعود",
        "محمد أحمد علي الجراح",
        "محمد أحمد خليف المرايات",
        "علي سليمان محمد الغزاوي",
        "عبدالرؤوف عبدالقادر سليمان الربيحات",
        "عبدالرحمن حسين محمد العوايشه"
    ],
    "كتلة حزب عزم": [
        "أيمن محمود عبدالله أبو هنية",
        "حسين خالد حسين الطراونة",
        "إبراهيم سلامه محمود الصرايره",
        "وليد حامد صالح المصري",
        "إبراهيم فنخير سالم الجبور",
        "أروى علي حمد الزبون",
        "آيات محمد أحمد بني عيسى",
        "إياد يعقوب سعيد جبرين",
        "تيسير سالم داود أبو عرابي العدوان",
        "خليفة سليمان محمد الديات",
        "محمد زكي محمد بني ملحم",
        "محمد سلامة عطالله الغويري",
        "مؤيد فضيل محمد العلاونة",
        "مي محمد علي السردية",
        "هدى ابراهيم نصار نفاع",
        "سالم حسني سالم العمري",
        "صالح ساري محمد أبو تايه",
        "محمد جميل محمد الظهراوي",
        "وصفي هلال عبدالله حداد"
    ],
    "كتلة حزب جبهة العمل الإسلامي": [
        "صالح عبدالكريم شحاده العرموطي",
        "محمد خليل محمد عقل",
        "عدنان يلدار الخاص مشوقه",
        "ينال عبدالسلام نورالدين الفريحات",
        "ابراهيم صالح هلال الحميدي",
        "احمد ابراهيم عبدالعزيز القطاونه",
        "احمد سليمان عوض الرقب",
        "ايمان محمد أمين إسحق العباسي",
        "ايمن توفيق يوسف أبو الرب",
        "باسم مرشد صالح الروابده",
        "بيان فخري عيسى المحسيري",
        "جهاد زهير سالم المدانات",
        "حامد خليل رشيد الرحامنة",
        "حسن صلاح صالح الرياطي",
        "خضر هليل مطير بني خالد",
        "راكين خلف محمد أبو هنية",
        "رائد طاهر حمدان القطامين",
        "معتز علي سالم الهروط",
        "موسى علي محمد الوحش",
        "ناصر سلامه عقلة نواصره",
        "هدى حسين محمد عتوم",
        "وسام محمد عبدالغني الربيحات",
        "سالم علي محمود أبو دولة",
        "مالك عبدالله علي الطهراوي",
        "لبنى محمد بكر النمور",
        "فتحي يوسف سلمان البوات",
        "علي محمود محمد الخزعلي",
        "حياه حسين علي مسيمي",
        "ديمه محمد طارق عبد الرحيم طهبوب",
        "نور حسني احمد أبو غوش",
        "نبيل كامل احمد الشيشاني"
    ],
    "كتلة تقدم النيابية": [
        "رائد مصباح طلب رباع",
        "سامر نوفان فضيل العبابسه",
        "نجمه شفيق خايف الهواوشه",
        "فراس محمد خليف القبلان",
        "احمد حسن موسى الشديفات",
        "آمال ضيف الله سليم الشقران",
        "بكر محمد عبدالغني الحيصة",
        "بدر عواد رجا الحراحشة",
        "خالد موسى عيسى أبو حسان",
        "محمد عبد الفتاح محمود هديب",
        "مصطفى فؤاد محمد الخصاونة",
        "فريال يوسف احمد بني سلمان",
        "عيسى مخائيل سلامة نصار",
        "عبدالهادي سليمان ثاني البريزات",
        "رند جهاد فؤاد الخزوز"
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
        
        # Partial match
        target_words = set(target_normalized.split())
        mp_words = set(mp_normalized.split())
        if target_words.issubset(mp_words) or mp_words.issubset(target_words):
            return mp
    
    return None

def main():
    print("=== Updating Ordinary Session 1 Bloc Memberships ===\n")
    
    mps = load_mps()
    changes = []
    notfound = []
    
    for bloc_name, member_names in ORDINARY_1_BLOCS.items():
        print(f"Processing: {bloc_name} ({len(member_names)} members)")
        
        for member_name in member_names:
            mp = find_mp_by_name(mps, member_name)
            
            if mp:
                # Update or create ordinary_1 membership
                if mp.get('memberships'):
                    found_ordinary_1 = False
                    for membership in mp['memberships']:
                        if membership['session'] == 'ordinary_1':
                            old_bloc = membership.get('bloc', '')
                            if old_bloc != bloc_name:
                                membership['bloc'] = bloc_name
                                changes.append(f"{mp['id']}: {old_bloc[:20]} -> {bloc_name[:20]}")
                            found_ordinary_1 = True
                            break
                    
                    # If no ordinary_1 membership exists, create one
                    if not found_ordinary_1:
                        mp['memberships'].insert(0, {
                            'session': 'ordinary_1',
                            'bloc': bloc_name
                        })
                        changes.append(f"{mp['id']}: ADDED -> {bloc_name[:20]}")
            else:
                notfound.append(member_name)
                print(f"  [NOT FOUND] {member_name}")
    
    # Save changes
    save_mps(mps)
    
    print(f"\n=== Results ===")
    print(f"Total changes: {len(changes)}")
    print(f"Not found: {len(notfound)}")
    
    # Verify
    from collections import Counter
    blocs = []
    for mp in mps:
        if mp.get('memberships'):
            for mem in mp['memberships']:
                if mem['session'] == 'ordinary_1':
                    blocs.append(mem.get('bloc', 'Unknown'))
                    break
    
    counts = Counter(blocs)
    
    expected = {
        "كتلة حزب الميثاق الوطني": 35,
        "كتلة حزب إرادة والوطني الإسلامي": 18,
        "كتلة اتحاد الأحزاب الوسطية": 18,
        "كتلة حزب عزم": 19,
        "كتلة حزب جبهة العمل الإسلامي": 31,
        "كتلة تقدم النيابية": 15
    }
    
    print("\n=== Final Verification (ordinary_1) ===")
    all_correct = True
    for bloc, exp in expected.items():
        actual = counts.get(bloc, 0)
        status = "[OK]" if actual == exp else "[WRONG]"
        print(f"{status} {bloc[:45]}: {actual}/{exp}")
        if actual != exp:
            all_correct = False
    
    total = sum(counts.values())
    print(f"\nTotal MPs with ordinary_1: {total}/138")
    
    if all_correct and total >= 136:
        print("\n*** SUCCESS! Ordinary_1 blocs updated! ***")
    else:
        print(f"\nSome issues remain")

if __name__ == '__main__':
    main()
