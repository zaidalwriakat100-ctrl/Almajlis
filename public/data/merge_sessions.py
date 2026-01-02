import json
import os
from datetime import datetime

# مسارات الملفات
base_path = r"c:\Users\Ultimate\Downloads\المشروع النهائي-26\frontend-20251226T203328Z-1-001\frontend\public\data"
sessions_json_path = os.path.join(base_path, "sessions.json")
updates_path = os.path.join(base_path, "session_updates")

# قراءة ملف sessions.json الحالي
print("قراءة ملف sessions.json...")
with open(sessions_json_path, 'r', encoding='utf-8') as f:
    sessions = json.load(f)
print(f"تم تحميل {len(sessions)} جلسة موجودة")

# الملفات الجديدة للدمج
new_session_files = [
    "العادية الأولى – الجلسة الأولى 18_11_2024.json",
    "العادية الأولى - الجلسة الثالثة (اليوم الأول) 2_12_2024.json",
    "العادية الأولى - الجلسة الثالثة (اليوم الثاني 1) 2_12_2024.json"
]

# التحقق من الـ IDs الموجودة
existing_ids = {s.get('id') for s in sessions}
print(f"الـ IDs الموجودة: {len(existing_ids)}")

# إيجاد أعلى رقم session_id
max_session_num = 0
for session in sessions:
    sid = session.get('id', '')
    if sid.startswith('session_'):
        try:
            num = int(sid.split('_')[1])
            if num > max_session_num:
                max_session_num = num
        except:
            pass

print(f"أعلى رقم جلسة: {max_session_num}")

# دمج الملفات الجديدة
added_count = 0
for filename in new_session_files:
    filepath = os.path.join(updates_path, filename)
    if not os.path.exists(filepath):
        print(f"⚠️ الملف غير موجود: {filename}")
        continue
    
    print(f"\nمعالجة: {filename}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        new_session = json.load(f)
    
    # استخراج التاريخ من اسم الملف
    date_str = None
    if "18_11_2024" in filename:
        date_str = "2024-11-18"
    elif "2_12_2024" in filename:
        date_str = "2024-12-02"
    
    # إنشاء هيكل الجلسة الكامل
    max_session_num += 1
    new_id = f"session_{max_session_num}"
    
    # التحقق من عدم التكرار
    if new_id in existing_ids:
        print(f"⚠️ الجلسة {new_id} موجودة بالفعل، تخطي...")
        continue
    
    # بناء الجلسة الكاملة
    full_session = {
        "id": new_id,
        "title": new_session.get("session_title", ""),
        "date": date_str,
        "term": new_session.get("term", "الدورة العادية الأولى"),
        "ordinaryTerm": 1,
        "duration": "غير محدد",
        "duration_sec": 0,
        "num_speakers": len(new_session.get("brief_summary", {}).get("mp_interventions", [])),
        "youtube": {
            "video_id": "",
            "url": ""
        },
        "stats": {
            "estimated_duration_minutes": 0,
            "distinct_speakers_count": len(new_session.get("brief_summary", {}).get("mp_interventions", []))
        },
        "brief_summary": new_session.get("brief_summary", {}),
        "topics": [],
        "chunks": []
    }
    
    sessions.append(full_session)
    existing_ids.add(new_id)
    added_count += 1
    print(f"✅ تمت إضافة: {full_session['title']} (ID: {new_id})")

# ترتيب الجلسات حسب الدورة ثم التاريخ
def sort_key(session):
    term = session.get('ordinaryTerm', 0)
    date = session.get('date', '1900-01-01') or '1900-01-01'
    return (-term, date)

sessions.sort(key=sort_key, reverse=True)

# حفظ الملف المحدث
print(f"\nحفظ الملف المحدث...")
with open(sessions_json_path, 'w', encoding='utf-8') as f:
    json.dump(sessions, f, ensure_ascii=False, indent=2)

print(f"\n✅ تم بنجاح!")
print(f"   - عدد الجلسات الكلي: {len(sessions)}")
print(f"   - عدد الجلسات المضافة: {added_count}")
