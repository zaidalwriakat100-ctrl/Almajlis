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

# MP Data with committees for both sessions
mp_data = {
    "إبراهيم سالمة محمود الصرايرة": {
        "ordinary_1": ["اللجنة القانونية", "اللجنة الإدارية"],
        "ordinary_2": ["اللجنة الإدارية"]
    },
    "إبراهيم صالح هلال الحميدي": {
        "ordinary_1": ["لجنة التربية والتعليم"],
        "ordinary_2": ["لجنة التربية والتعليم", "اللجنة الإدارية"]
    },
    "إبراهيم صقر سليمان القرالة": {
        "ordinary_1": ["لجنة الحريات العامة وحقوق الإنسان", "لجنة التربية والتعليم"],
        "ordinary_2": ["لجنة التربية والتعليم", "لجنة الاقتصاد الرقمي والريادة"]
    },
    "إبراهيم فنخير سالم الجبور": {
        "ordinary_1": ["لجنة الحريات العامة وحقوق الإنسان", "لجنة التربية والتعليم"],
        "ordinary_2": ["اللجنة القانونية", "اللجنة المالية"]
    },
    "إبراهيم يوسف صالح الطراونة": {
        "ordinary_1": ["اللجنة المالية", "لجنة الشؤون الخارجية"],
        "ordinary_2": ["اللجنة المالية", "لجنة فلسطين"]
    },
    "أحمد إبراهيم سلامة الهميسات": {
        "ordinary_1": [],
        "ordinary_2": ["لجنة التوجيه الوطني والإعلام", "لجنة الحريات العامة وحقوق الإنسان"]
    },
    "أحمد إبراهيم عبدالعزيز القطاونة": {
        "ordinary_1": ["لجنة الحريات العامة وحقوق الإنسان"],
        "ordinary_2": ["لجنة الحريات العامة وحقوق الإنسان"]
    },
    "أحمد جميل عبدالقادر عشا": {
        "ordinary_1": ["لجنة الصحة والغذاء"],
        "ordinary_2": ["لجنة البيئة والمناخ"]
    },
    "أحمد حسن موسى الشديفات": {
        "ordinary_1": ["لجنة الزراعة والمياه", "لجنة الشباب والرياضة والثقافة"],
        "ordinary_2": ["لجنة الزراعة والمياه", "لجنة الطاقة والثروة المعدنية"]
    },
    "أحمد حمدان ندى العليمات": {
        "ordinary_1": ["لجنة الاقتصاد الرقمي والريادة", "اللجنة الإدارية"],
        "ordinary_2": ["اللجنة الإدارية", "لجنة الحريات العامة وحقوق الإنسان"]
    },
    "أحمد سليمان عوض الرقب": {
        "ordinary_1": ["لجنة التوجيه الوطني والإعلام"],
        "ordinary_2": ["لجنة التوجيه الوطني والإعلام"]
    },
    "أحمد عبدالعزيز أحمد السراحنة": {
        "ordinary_1": ["لجنة الصحة والغذاء", "لجنة فلسطين"],
        "ordinary_2": ["لجنة الصحة والغذاء", "لجنة فلسطين"]
    },
    "أحمد محمد علي الصفدي": {
        "ordinary_1": [],
        "ordinary_2": []
    },
    "أروى علي حمد الزبون": {
        "ordinary_1": ["لجنة العمل والتنمية الاجتماعية والسكان", "لجنة التوجيه الوطني والإعلام"],
        "ordinary_2": ["لجنة الرد على خطاب العرش", "لجنة التوجيه الوطني والإعلام", "لجنة العمل والتنمية الاجتماعية والسكان"]
    },
    "إسلام لويفي عيد اليتيم العزازمة": {
        "ordinary_1": ["لجنة الطاقة والثروة المعدنية", "لجنة المرأة وشؤون الأسرة"],
        "ordinary_2": ["لجنة الطاقة والثروة المعدنية", "لجنة المرأة وشؤون الأسرة"]
    },
    "إسماعيل راشد عبود المشاقبة": {
        "ordinary_1": ["لجنة التوجيه الوطني والإعلام", "لجنة فلسطين"],
        "ordinary_2": ["لجنة التوجيه الوطني والإعلام"]
    },
    "آمال ضيف الله سليم الشقران": {
        "ordinary_1": ["لجنة الاقتصاد والاستثمار", "لجنة الحريات العامة وحقوق الإنسان"],
        "ordinary_2": ["لجنة الصحة والغذاء", "لجنة الخدمات العامة والنقل", "لجنة الرد على خطاب العرش"]
    },
    "أندريه مراد محمود عبدالجليل حواري": {
        "ordinary_1": ["لجنة الاقتصاد الرقمي والريادة"],
        "ordinary_2": ["لجنة المرأة وشؤون الأسرة", "لجنة العمل والتنمية الاجتماعية والسكان"]
    },
    "آيات محمد أحمد بني عيسى": {
        "ordinary_1": ["لجنة الطاقة والثروة المعدنية", "لجنة الاقتصاد والاستثمار"],
        "ordinary_2": ["لجنة التوجيه الوطني والإعلام"]
    },
    "إياد يعقوب سعيد جبرين": {
        "ordinary_1": ["لجنة الزراعة والمياه", "لجنة السياحة والآثار"],
        "ordinary_2": ["لجنة الزراعة والمياه"]
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

    print(f"\nUpdated {updated_count} MPs.")
    save_data(mps_path, mps)
    print("Data saved successfully!")

if __name__ == "__main__":
    main()
