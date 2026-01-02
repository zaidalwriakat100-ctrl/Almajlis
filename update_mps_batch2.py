import json
import re
import difflib

def load_data(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_data(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    with open(filepath, 'a', encoding='utf-8') as f:
        f.write('\n')

def normalize_name(name):
    titles = ["سعادة", "السيد", "الدكتور", "المهندس", "المحامي", "السيدة", "الآنسة", "الدكتورة", "المهندسة", "المحامية"]
    for title in titles:
        name = name.replace(title, "")
    name = re.sub(r'\s+', ' ', name).strip()
    name = re.sub(r'[أإآ]', 'ا', name)
    name = name.replace("ة", "ه")
    return name

def find_mp_by_name(name, mps_data):
    normalized_input = normalize_name(name)
    best_match = None
    highest_ratio = 0.0
    
    for mp in mps_data:
        mp_name = mp.get('fullName', '')
        normalized_mp = normalize_name(mp_name)
        
        if normalized_input == normalized_mp:
            return mp
        
        ratio = difflib.SequenceMatcher(None, normalized_input, normalized_mp).ratio()
        if ratio > highest_ratio:
            highest_ratio = ratio
            best_match = mp
            
    if highest_ratio > 0.85:
        return best_match
    return None

# MP Data batch 2: MPs 21-40
mp_data = {
    "آية الله محمد علي الفريحات": {
        "ordinary_1": ["اللجنة القانونية"],
        "ordinary_2": ["اللجنة الإدارية", "اللجنة القانونية"]
    },
    "إيمان محمد أمين إسحق العباسي": {
        "ordinary_1": ["لجنة المرأة وشؤون الأسرة"],
        "ordinary_2": ["لجنة الشؤون الخارجية", "لجنة المرأة وشؤون الأسرة"]
    },
    "أيمن توفيق يوسف أبو الرب": {
        "ordinary_1": ["لجنة فلسطين"],
        "ordinary_2": ["لجنة الصحة والغذاء", "لجنة فلسطين"]
    },
    "أيمن عودة محمد البدادوة": {
        "ordinary_1": ["اللجنة الإدارية", "لجنة الخدمات العامة والنقل"],
        "ordinary_2": ["لجنة الرد على خطاب العرش", "لجنة الخدمات العامة والنقل", "لجنة الريف والبادية"]
    },
    "أيمن محمود عبدالله أبو هنية": {
        "ordinary_1": ["لجنة الطاقة والثروة المعدنية"],
        "ordinary_2": ["لجنة الرد على خطاب العرش", "لجنة الطاقة والثروة المعدنية", "لجنة الاقتصاد الرقمي والريادة"]
    },
    "باسم مرشد صالح الروابدة": {
        "ordinary_1": ["لجنة الحريات العامة وحقوق الإنسان", "لجنة الزراعة والمياه"],
        "ordinary_2": ["لجنة الرد على خطاب العرش", "لجنة الزراعة والمياه"]
    },
    "بدر عواد رجا الحراحشة": {
        "ordinary_1": ["لجنة البيئة والمناخ", "لجنة الشؤون الخارجية"],
        "ordinary_2": ["لجنة الاقتصاد والاستثمار", "لجنة الشؤون الخارجية"]
    },
    "بكر محمد عبدالغني الحيصة": {
        "ordinary_1": ["لجنة الشؤون الخارجية", "لجنة الريف والبادية"],
        "ordinary_2": ["لجنة الشباب والرياضة والثقافة", "لجنة الريف والبادية"]
    },
    "بيان فخري عيسى المحسيري": {
        "ordinary_1": ["لجنة المرأة وشؤون الأسرة"],
        "ordinary_2": ["لجنة الرد على خطاب العرش", "لجنة المرأة وشؤون الأسرة", "اللجنة القانونية"]
    },
    "تمارا يعقوب عادل ناصرالدين": {
        "ordinary_1": ["لجنة الشؤون الخارجية", "لجنة التربية والتعليم"],
        "ordinary_2": ["لجنة التربية والتعليم", "لجنة الشؤون الخارجية"]
    },
    "تيسير سالم داود أبو عرابي العدوان": {
        "ordinary_1": ["لجنة الخدمات العامة والنقل", "لجنة فلسطين"],
        "ordinary_2": ["اللجنة الإدارية", "لجنة الخدمات العامة والنقل"]
    },
    "جمال عيسى جريس قموه": {
        "ordinary_1": ["لجنة السياحة والآثار"],
        "ordinary_2": ["لجنة الطاقة والثروة المعدنية", "لجنة السياحة والآثار"]
    },
    "جميل أحمد محمد الدهيسات": {
        "ordinary_1": ["اللجنة الإدارية", "لجنة العمل والتنمية الاجتماعية والسكان"],
        "ordinary_2": []
    },
    "جهاد زهير سالم المدانات": {
        "ordinary_1": ["لجنة الخدمات العامة والنقل", "لجنة السياحة والآثار"],
        "ordinary_2": ["لجنة الخدمات العامة والنقل", "لجنة السياحة والآثار"]
    },
    "جهاد عبدالمجيد خميس عبوي": {
        "ordinary_1": ["لجنة البيئة والمناخ", "لجنة التوجيه الوطني والإعلام"],
        "ordinary_2": ["لجنة البيئة والمناخ", "لجنة التوجيه الوطني والإعلام"]
    },
    "حابس ركاد خليف الشبيب": {
        "ordinary_1": ["لجنة الزراعة والمياه", "لجنة الريف والبادية"],
        "ordinary_2": []
    },
    "حابس سامي مثقال الفايز": {
        "ordinary_1": ["لجنة الزراعة والمياه", "اللجنة الإدارية"],
        "ordinary_2": ["لجنة الزراعة والمياه", "لجنة الحريات العامة وحقوق الإنسان"]
    },
    "حامد خليل رشيد الرحامنة": {
        "ordinary_1": ["لجنة الاقتصاد الرقمي والريادة", "لجنة الريف والبادية"],
        "ordinary_2": ["لجنة الاقتصاد الرقمي والريادة"]
    },
    "حسن صالح صالح الرياطي": {
        "ordinary_1": ["لجنة السياحة والآثار"],
        "ordinary_2": ["لجنة الخدمات العامة والنقل"]
    },
    "حسين خالد حسين الطراونة": {
        "ordinary_1": ["لجنة البيئة والمناخ", "لجنة الصحة والغذاء"],
        "ordinary_2": ["لجنة الصحة والغذاء", "لجنة البيئة والمناخ"]
    }
}

def main():
    mps_path = 'public/data/mps.json'
    
    try:
        mps = load_data(mps_path)
    except FileNotFoundError:
        print(f"Error: {mps_path} not found.")
        return

    updated_count = 0
    
    for name, sessions_data in mp_data.items():
        mp = find_mp_by_name(name, mps)
        
        if not mp:
            print(f"Warning: Could not find MP for '{name}'")
            continue
        
        print(f"Updating: {mp['fullName']}")
        updated_count += 1
        
        # Ensure memberships exists
        if 'memberships' not in mp:
            mp['memberships'] = []
        
        # Update Session 1 (ordinary_1)
        session1 = next((s for s in mp['memberships'] if s['session'] == 'ordinary_1'), None)
        if not session1:
            session1 = {'session': 'ordinary_1'}
            mp['memberships'].append(session1)
        
        if sessions_data['ordinary_1']:
            session1['committees'] = sessions_data['ordinary_1']
        elif 'committees' in session1:
            del session1['committees']
        
        # Update Session 2 (ordinary_2)
        session2 = next((s for s in mp['memberships'] if s['session'] == 'ordinary_2'), None)
        if not session2:
            session2 = {'session': 'ordinary_2'}
            mp['memberships'].append(session2)
        
        if sessions_data['ordinary_2']:
            session2['committees'] = sessions_data['ordinary_2']
        elif 'committees' in session2:
            del session2['committees']

    print(f"\nUpdated {updated_count} MPs (batch 2: MPs 21-40).")
    save_data(mps_path, mps)
    print("Data saved successfully!")

if __name__ == "__main__":
    main()
