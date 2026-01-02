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

# MP Data batch 4: MPs 61-80
mp_data = {
    "سالم حسني سالم العمري": {
        "ordinary_1": ["لجنة السياحة والآثار", "لجنة التوجيه الوطني والإعلام"],
        "ordinary_2": ["لجنة الاقتصاد الرقمي والريادة", "لجنة السياحة والآثار"]
    },
    "سالم علي محمود أبو دولة": {
        "ordinary_1": ["لجنة الاقتصاد والاستثمار"],
        "ordinary_2": ["لجنة الاقتصاد والاستثمار"]
    },
    "سامر نوفان فضيل العبابسة": {
        "ordinary_1": ["اللجنة الإدارية", "لجنة العمل والتنمية الاجتماعية والسكان"],
        "ordinary_2": ["لجنة الرد على خطاب العرش", "لجنة العمل والتنمية الاجتماعية والسكان", "لجنة الريف والبادية"]
    },
    "سليمان حمدان سالم الخرابشة": {
        "ordinary_1": ["لجنة الاقتصاد الرقمي والريادة", "اللجنة المالية"],
        "ordinary_2": ["اللجنة المالية", "لجنة الاقتصاد الرقمي والريادة"]
    },
    "سليمان حويلة عيد الزبن": {
        "ordinary_1": ["لجنة الحريات العامة وحقوق الإنسان", "لجنة التربية والتعليم"],
        "ordinary_2": ["اللجنة الإدارية", "لجنة الحريات العامة وحقوق الإنسان"]
    },
    "سليمان عبدالعزيز سليمان السعود": {
        "ordinary_1": ["لجنة الخدمات العامة والنقل", "لجنة فلسطين"],
        "ordinary_2": ["لجنة الرد على خطاب العرش", "لجنة البيئة والمناخ", "لجنة فلسطين"]
    },
    "شاهر سعد صالح الشطناوي": {
        "ordinary_1": ["لجنة الصحة والغذاء"],
        "ordinary_2": ["لجنة الصحة والغذاء", "لجنة الحريات العامة وحقوق الإنسان"]
    },
    "شفاء عيسى محمد صوان": {
        "ordinary_1": ["لجنة العمل والتنمية الاجتماعية والسكان", "لجنة الزراعة والمياه"],
        "ordinary_2": ["لجنة التربية والتعليم", "لجنة العمل والتنمية الاجتماعية والسكان"]
    },
    "صالح ساري محمد أبو تايه": {
        "ordinary_1": ["لجنة الريف والبادية"],
        "ordinary_2": ["لجنة الطاقة والثروة المعدنية", "لجنة الريف والبادية"]
    },
    "صالح عبدالكريم شحادة العرموطي": {
        "ordinary_1": [],
        "ordinary_2": []
    },
    "طارق عبدالمهدي عبدالله بني هاني": {
        "ordinary_1": ["لجنة الاقتصاد والاستثمار", "لجنة الخدمات العامة والنقل"],
        "ordinary_2": ["لجنة الاقتصاد والاستثمار", "لجنة الخدمات العامة والنقل"]
    },
    "طلال محمد عبدالوالي النسور": {
        "ordinary_1": ["لجنة الطاقة والثروة المعدنية"],
        "ordinary_2": ["لجنة الطاقة والثروة المعدنية", "لجنة فلسطين"]
    },
    "عارف منور عبدالرحمن السعايدة العبادي": {
        "ordinary_1": ["اللجنة القانونية"],
        "ordinary_2": ["لجنة فلسطين", "اللجنة القانونية"]
    },
    "عبدالباسط عبدالله سعيد الكباريتي": {
        "ordinary_1": ["اللجنة الإدارية", "لجنة الحريات العامة وحقوق الإنسان"],
        "ordinary_2": ["لجنة الرد على خطاب العرش", "لجنة الاقتصاد والاستثمار", "اللجنة الإدارية"]
    },
    "عبدالحليم محمد عبدالحليم عنانبة": {
        "ordinary_1": ["اللجنة القانونية", "لجنة الشباب والرياضة والثقافة"],
        "ordinary_2": ["لجنة الشباب والرياضة والثقافة", "اللجنة القانونية"]
    },
    "عبدالرحمن حسين محمد العوايشة": {
        "ordinary_1": ["لجنة العمل والتنمية الاجتماعية والسكان"],
        "ordinary_2": ["لجنة الاقتصاد والاستثمار", "لجنة العمل والتنمية الاجتماعية والسكان"]
    },
    "عبدالرؤوف عبدالقادر سليمان الربيحات": {
        "ordinary_1": ["لجنة العمل والتنمية الاجتماعية والسكان", "لجنة الخدمات العامة والنقل"],
        "ordinary_2": ["لجنة الرد على خطاب العرش", "لجنة الشباب والرياضة والثقافة", "لجنة الخدمات العامة والنقل"]
    },
    "عبدالناصر هاشم محمود الخصاونة": {
        "ordinary_1": ["لجنة الطاقة والثروة المعدنية", "لجنة الشباب والرياضة والثقافة"],
        "ordinary_2": ["لجنة الشباب والرياضة والثقافة", "لجنة الصحة والغذاء"]
    },
    "عبدالهادي سليمان ثاني البريزات": {
        "ordinary_1": ["لجنة البيئة والمناخ", "لجنة الصحة والغذاء"],
        "ordinary_2": ["لجنة الصحة والغذاء", "لجنة البيئة والمناخ"]
    },
    "عثمان عبدالله سليمان المخادمة": {
        "ordinary_1": ["لجنة الطاقة والثروة المعدنية", "لجنة الصحة والغذاء"],
        "ordinary_2": ["لجنة فلسطين", "لجنة الشؤون الخارجية"]
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

    print(f"\nUpdated {updated_count} MPs (batch 4: MPs 61-80).")
    save_data(mps_path, mps)
    print("Data saved successfully!")

if __name__ == "__main__":
    main()
