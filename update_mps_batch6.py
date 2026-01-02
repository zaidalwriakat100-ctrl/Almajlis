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

# MP Data batch 6: MPs 101-120
mp_data = {
    "محمد جميل محمد الظهراوي": {
        "ordinary_1": ["لجنة فلسطين"],
        "ordinary_2": []
    },
    "محمد خليل محمد عقل": {
        "ordinary_1": ["لجنة الشؤون الخارجية"],
        "ordinary_2": []
    },
    "محمد زكي محمد بني ملحم": {
        "ordinary_1": ["اللجنة القانونية", "اللجنة المالية"],
        "ordinary_2": ["لجنة الرد على خطاب العرش", "اللجنة القانونية"]
    },
    "محمد سالمة عبدالله السبايلة": {
        "ordinary_1": ["لجنة الحريات العامة وحقوق الإنسان", "لجنة التوجيه الوطني والإعلام"],
        "ordinary_2": ["لجنة الرد على خطاب العرش", "لجنة الشؤون الخارجية", "لجنة التوجيه الوطني والإعلام"]
    },
    "محمد سالمة عطالله الغويري": {
        "ordinary_1": ["اللجنة الإدارية", "لجنة الحريات العامة وحقوق الإنسان"],
        "ordinary_2": ["لجنة الرد على خطاب العرش", "اللجنة الإدارية", "اللجنة القانونية"]
    },
    "محمد عبدالرزاق عيد الرعود": {
        "ordinary_1": ["لجنة التربية والتعليم", "لجنة التوجيه الوطني والإعلام"],
        "ordinary_2": ["لجنة الرد على خطاب العرش", "لجنة التربية والتعليم", "لجنة التوجيه الوطني والإعلام"]
    },
    "محمد عبد الفتاح محمود هديب": {
        "ordinary_1": ["لجنة الشباب والرياضة والثقافة", "لجنة فلسطين"],
        "ordinary_2": []
    },
    "محمد عبدالله علي البستنجي": {
        "ordinary_1": ["لجنة الاقتصاد والاستثمار", "اللجنة المالية"],
        "ordinary_2": ["اللجنة المالية"]
    },
    "محمد فخري شكري كتاو": {
        "ordinary_1": ["اللجنة المالية"],
        "ordinary_2": ["لجنة الاقتصاد والاستثمار", "لجنة العمل والتنمية الاجتماعية والسكان"]
    },
    "محمد قاسم سليمان المراعية": {
        "ordinary_1": [],
        "ordinary_2": ["لجنة الزراعة والمياه", "لجنة الريف والبادية"]
    },
    "محمد يحيى محمد المحارمة": {
        "ordinary_1": ["لجنة البيئة والمناخ", "لجنة الشباب والرياضة والثقافة"],
        "ordinary_2": ["لجنة التربية والتعليم", "لجنة الشباب والرياضة والثقافة"]
    },
    "محمود خلف حمد النعيمات": {
        "ordinary_1": [],
        "ordinary_2": ["لجنة الرد على خطاب العرش"]
    },
    "مصطفى صالح مصطفى العماوي": {
        "ordinary_1": ["اللجنة القانونية", "لجنة فلسطين"],
        "ordinary_2": []
    },
    "مصطفى فؤاد محمد الخصاونة": {
        "ordinary_1": [],
        "ordinary_2": ["لجنة الرد على خطاب العرش", "لجنة الشباب والرياضة والثقافة", "لجنة فلسطين"]
    },
    "معتز علي سالم الهروط": {
        "ordinary_1": ["لجنة الشباب والرياضة والثقافة"],
        "ordinary_2": ["لجنة الشباب والرياضة والثقافة"]
    },
    "معتز محمد موسى أبو رمان": {
        "ordinary_1": ["لجنة العمل والتنمية الاجتماعية والسكان", "لجنة الريف والبادية"],
        "ordinary_2": ["لجنة العمل والتنمية الاجتماعية والسكان", "لجنة الريف والبادية"]
    },
    "موسى علي محمد الوحش": {
        "ordinary_1": ["اللجنة المالية", "لجنة الريف والبادية"],
        "ordinary_2": ["اللجنة المالية", "لجنة الاقتصاد والاستثمار"]
    },
    "مؤيد فضيل محمد العالونة": {
        "ordinary_1": ["لجنة الاقتصاد الرقمي والريادة", "لجنة الشباب والرياضة والثقافة"],
        "ordinary_2": ["لجنة الرد على خطاب العرش", "لجنة الشباب والرياضة والثقافة", "لجنة الاقتصاد الرقمي والريادة"]
    },
    "مي محمد علي السردية": {
        "ordinary_1": ["لجنة الشؤون الخارجية", "لجنة المرأة وشؤون الأسرة"],
        "ordinary_2": ["لجنة السياحة والآثار", "لجنة الريف والبادية"]
    },
    "مي محمود علي حراحشة": {
        "ordinary_1": ["لجنة المرأة وشؤون الأسرة", "لجنة الخدمات العامة والنقل"],
        "ordinary_2": ["لجنة الطاقة والثروة المعدنية", "لجنة المرأة وشؤون الأسرة"]
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

    print(f"\nUpdated {updated_count} MPs (batch 6: MPs 101-120).")
    save_data(mps_path, mps)
    print("Data saved successfully!")

if __name__ == "__main__":
    main()
