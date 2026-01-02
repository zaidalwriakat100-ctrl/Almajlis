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

# MP Data batch 5: MPs 81-100
mp_data = {
    "عدنان يلدار الخاص مشوقة": {
        "ordinary_1": ["لجنة الاقتصاد الرقمي والريادة"],
        "ordinary_2": ["لجنة الاقتصاد الرقمي والريادة", "لجنة البيئة والمناخ"]
    },
    "عطالله علي قاضي الحنيطي": {
        "ordinary_1": ["لجنة الشباب والرياضة والثقافة", "لجنة التوجيه الوطني والإعلام"],
        "ordinary_2": ["اللجنة الإدارية", "لجنة الشباب والرياضة والثقافة"]
    },
    "علي سالم فاضل الخلايلة": {
        "ordinary_1": [],
        "ordinary_2": ["لجنة الرد على خطاب العرش"]
    },
    "علي سليمان محمد الغزاوي": {
        "ordinary_1": ["لجنة البيئة والمناخ", "لجنة الزراعة والمياه"],
        "ordinary_2": ["لجنة الخدمات العامة والنقل", "لجنة الشؤون الخارجية"]
    },
    "علي محمود محمد الخزعلي": {
        "ordinary_1": ["لجنة الريف والبادية"],
        "ordinary_2": ["لجنة الريف والبادية"]
    },
    "عمر عواد فليح بني خالد": {
        "ordinary_1": ["لجنة الزراعة والمياه", "لجنة الصحة والغذاء"],
        "ordinary_2": ["لجنة الزراعة والمياه", "لجنة البيئة والمناخ"]
    },
    "عوني علي طالل الزعبي": {
        "ordinary_1": ["اللجنة القانونية", "اللجنة المالية"],
        "ordinary_2": ["اللجنة المالية", "اللجنة القانونية"]
    },
    "عيسى ميخائيل سالمة نصار": {
        "ordinary_1": ["لجنة العمل والتنمية الاجتماعية والسكان", "لجنة التربية والتعليم"],
        "ordinary_2": ["لجنة التربية والتعليم", "لجنة العمل والتنمية الاجتماعية والسكان"]
    },
    "فتحي يوسف سلمان البوات": {
        "ordinary_1": ["لجنة البيئة والمناخ", "لجنة الزراعة والمياه"],
        "ordinary_2": ["لجنة الزراعة والمياه", "لجنة البيئة والمناخ"]
    },
    "فراس محمد خليف القبالن": {
        "ordinary_1": ["لجنة التوجيه الوطني والإعلام"],
        "ordinary_2": ["لجنة التوجيه الوطني والإعلام", "لجنة الحريات العامة وحقوق الإنسان"]
    },
    "فلاير يوسف أحمد بني سلمان": {
        "ordinary_1": ["اللجنة الإدارية", "لجنة السياحة والآثار"],
        "ordinary_2": ["لجنة التربية والتعليم", "لجنة الريف والبادية"]
    },
    "فليح سالمه مقبول السبيتان": {
        "ordinary_1": ["لجنة الاقتصاد الرقمي والريادة", "لجنة المرأة وشؤون الأسرة"],
        "ordinary_2": ["لجنة الرد على خطاب العرش", "لجنة المرأة وشؤون الأسرة", "لجنة الريف والبادية"]
    },
    "قاسم عبدالله محمد القباعي": {
        "ordinary_1": ["لجنة الطاقة والثروة المعدنية", "لجنة الزراعة والمياه"],
        "ordinary_2": ["لجنة الزراعة والمياه", "لجنة الطاقة والثروة المعدنية"]
    },
    "لبنى محمد بكر النمور": {
        "ordinary_1": ["لجنة العمل والتنمية الاجتماعية والسكان"],
        "ordinary_2": ["لجنة العمل والتنمية الاجتماعية والسكان"]
    },
    "مازن تركي سعود القاضي": {
        "ordinary_1": [],
        "ordinary_2": []
    },
    "مالك عبدالله علي الطهراوي": {
        "ordinary_1": ["اللجنة القانونية"],
        "ordinary_2": ["لجنة الحريات العامة وحقوق الإنسان"]
    },
    "مجحم حمد حسين الصقور": {
        "ordinary_1": [],
        "ordinary_2": ["لجنة الحريات العامة وحقوق الإنسان"]
    },
    "محمد أحمد خليف المرايات": {
        "ordinary_1": ["لجنة العمل والتنمية الاجتماعية والسكان", "لجنة فلسطين"],
        "ordinary_2": ["لجنة الزراعة والمياه"]
    },
    "محمد أحمد عبدالدايم المحاميد": {
        "ordinary_1": ["لجنة الحريات العامة وحقوق الإنسان", "لجنة الخدمات العامة والنقل"],
        "ordinary_2": ["لجنة الخدمات العامة والنقل", "لجنة السياحة والآثار"]
    },
    "محمد أحمد علي الجراح": {
        "ordinary_1": ["لجنة الاقتصاد والاستثمار", "لجنة الشؤون الخارجية"],
        "ordinary_2": ["لجنة الاقتصاد الرقمي والريادة", "لجنة الحريات العامة وحقوق الإنسان"]
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

    print(f"\nUpdated {updated_count} MPs (batch 5: MPs 81-100).")
    save_data(mps_path, mps)
    print("Data saved successfully!")

if __name__ == "__main__":
    main()
