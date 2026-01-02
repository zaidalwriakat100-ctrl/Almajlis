
import json
import os

# Data path
DATA_DIR = os.path.join(os.getcwd(), 'public', 'data')
BLOCS_FILE = os.path.join(DATA_DIR, 'blocs.json')
MPS_FILE = os.path.join(DATA_DIR, 'mps.json')

# Session 1 Data provided by user
SESSION_1_BLOCS_RAW = {
    "كتلة حزب الميثاق الوطني": [
        "مازن تركي سعود القاضي", "عبدالباسط عبدالله سعيد الكباريتي", "مي محمود علي حراحشة", "حمزة محمد محمود الحوامدة",
        "إبراهيم يوسف صالح الطراونة", "أحمد جميل عبدالقادر عشا", "أحمد حمدان ندى العليمات", "أحمد عبدالعزيز أحمد السراحنه",
        "أحمد محمد علي الصفدي", "إسلام لويفي عيدالاتيم العزازمة", "أندريه مراد محمود عبدالجليل حواري", "حابس ركاد خليف الشبيب",
        "حابس سامي مثقال الفايز", "حسين سعود عوض مرعي كريشان", "رانية محمد حسن الخليفات", "محمد يحيا محمد المحارمه",
        "محمود خلف حمد النعيمات", "نصار حسن سالم القيسي", "هايل فريح جريس عياش", "هيثم جريس عوده الزيادين",
        "يوسف محمد هارون الرواضيه", "سليمان حمدان سالم الخرابشة", "شاهر سعد صالح الشطناوي", "طلال محمد عبدالوالي النسور",
        "عارف منور عبدالرحمن السعايده العبادي", "مجحم حمد حسين الصقور", "فليحه سلامه مقبول السبيتان", "عوني علي طلال الزعبي",
        "عمر عواد فليح بني خالد", "علي سالم فاضل الخلايله", "عثمان عبدالله سليمان المخادمة", "عبد الناصر هاشم محمود الخصاونة",
        "عبدالحليم محمد عبدالحليم عنانبة", "تمارا يعقوب عادل ناصرالدين", "محمد فخري شكري كتاو"
    ],
    "كتلة حزب إرادة والوطني الإسلامي": [
        "خميس حسين خليل عطية", "نسيم عارف إبراهيم العبادي", "هاله يوسف محمود الجراح", "عطالله علي قاضي الحنيطي",
        "أحمد إبراهيم سلامه الهميسات", "جميل أحمد محمد الدهيسات", "حسين علي محمود العموش", "حمود إبراهيم أحمد الزواهره",
        "دينا عوني محمد البشير", "محمد سلامة عبدالله السبايلة", "محمد عبدالرزاق عيد الرعود", "محمد عبدالله علي البستنجي",
        "مصطفى صالح مصطفى العماوي", "ميسون صبحي محمد القوابعة", "نمر عبدالحميد عبدالله الفقهاء العبادي", "شفاء عيسى محمد صوان",
        "طارق عبد المهدي عبدالله بني هاني", "محمد أحمد عبدالدايم المحاميد"
    ],
    "كتلة اتحاد الأحزاب الوسطية": [
        "زهير محمد زهير الخشمان", "رانيا منصور عواد أبو رمان", "إبراهيم صقر سليمان القرالة", "قاسم عبدالله محمد القباعي",
        "أيمن عودة محمد البدادوة", "جميل عيسى جريس قموه", "جهاد عبد المجيد خميس عبوي", "حكم منصور ظاهر المعادات",
        "خالد علي محمد المسامره العقيلات", "محمد قاسم سليمان المراعية", "معتز محمد موسى أبو رمان", "سليمان حويلة عيد الزبن",
        "سليمان عبد العزيز سليمان السعود", "محمد أحمد علي الجراح", "محمد أحمد خليف المرايات", "علي سليمان محمد الغزاوي",
        "عبدالرؤوف عبدالقادر سليمان الربيحات", "عبدالرحمن حسين محمد العوايشه"
    ],
    "كتلة حزب عزم": [
        "أيمن محمود عبدالله أبو هنية", "حسين خالد حسين الطراونة", "إبراهيم سلامه محمود الصرايره", "وليد حامد صالح المصري",
        "إبراهيم فنخير سالم الجبور", "أروى علي حمد الزبون", "آيات محمد أحمد بني عيسى", "إياد يعقوب سعيد جبرين",
        "تيسير سالم داود أبو عرابي العدوان", "خليفة سليمان محمد الديات", "محمد زكي محمد بني ملحم", "محمد سلامة عطالله الغويري",
        "مؤيد فضيل محمد العلاونة", "مي محمد علي السردية", "هدى ابراهيم نصار نفاع", "سالم حسني سالم العمري",
        "صالح ساري محمد أبو تايه", "محمد جميل محمد الظهراوي", "وصفي هلال عبدالله حداد"
    ],
    "كتلة حزب جبهة العمل الإسلامي": [
        "صالح عبدالكريم شحاده العرموطي", "محمد خليل محمد عقل", "عدنان يلدار الخاص مشوقه", "ينال عبدالسلام نورالدين الفريحات",
        "ابراهيم صالح هلال الحميدي", "احمد ابراهيم عبدالعزيز القطاونه", "احمد سليمان عوض الرقب", "ايمان محمد أمين إسحق العباسي",
        "ايمن توفيق يوسف أبو الرب", "باسم مرشد صالح الروابده", "بيان فخري عيسى المحسيري", "جهاد زهير سالم المدانات",
        "حامد خليل رشيد الرحامنة", "حسن صلاح صالح الرياطي", "خضر هليل مطير بني خالد", "راكين خلف محمد أبو هنية",
        "رائد طاهر حمدان القطامين", "معتز علي سالم الهروط", "موسى علي محمد الوحش", "ناصر سلامه عقلة نواصره",
        "هدى حسين محمد عتوم", "وسام محمد عبدالغني الربيحات", "سالم علي محمود أبو دولة", "مالك عبدالله علي الطهراوي",
        "لبنى محمد بكر النمور", "فتحي يوسف سلمان البوات", "علي محمود محمد الخزعلي", "حياه حسين علي مسيمي",
        "ديمه محمد طارق عبد الرحيم طهبوب", "نور حسني احمد أبو غوش", "نبيل كامل احمد الشيشاني"
    ],
    "كتلة تقدم النيابية": [
        "رائد مصباح طلب رباع", "سامر نوفان فضيل العبابسه", "نجمه شفيق خايف الهواوشه", "فراس محمد خليف القبلان",
        "احمد حسن موسى الشديفات", "آمال ضيف الله سليم الشقران", "بكر محمد عبدالغني الحيصة", "بدر عواد رجا الحراحشة",
        "خالد موسى عيسى أبو حسان", "محمد عبد الفتاح محمود هديب", "مصطفى فؤاد محمد الخصاونة", "فريال يوسف احمد بني سلمان",
        "عيسى مخائيل سلامة نصار", "عبدالهادي سليمان ثاني البريزات", "رند جهاد فؤاد الخزوز"
    ]
}

# Mapping for Bloc info (reuse IDs and colors mostly)
BLOC_INFO_MAP = {
    "كتلة حزب الميثاق الوطني": {"id": "bloc_charter_1", "color": "#1e3a8a", "leadParty": "حزب الميثاق الوطني"},
    "كتلة حزب إرادة والوطني الإسلامي": {"id": "bloc_erada_national_1", "color": "#0891b2", "leadParty": "تحالف إرادة والوطني الإسلامي"},
    "كتلة اتحاد الأحزاب الوسطية": {"id": "bloc_centrist_1", "color": "#7c2d12", "leadParty": "اتحاد الأحزاب الوسطية"},
    "كتلة حزب جبهة العمل الإسلامي": {"id": "bloc_iaf_1", "color": "#007A3D", "leadParty": "حزب جبهة العمل الإسلامي"},
    "كتلة حزب عزم": {"id": "bloc_azm_1", "color": "#4338ca", "leadParty": "حزب عزم"},
    "كتلة تقدم النيابية": {"id": "bloc_taqadom_1", "color": "#d97706", "leadParty": "حزب تقدم"}
}

def normalize_name(name):
    """Normalize Arabic names for better matching."""
    name = name.strip()
    name = name.replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا')
    name = name.replace('ة', 'ه')
    name = name.replace('ى', 'ي')
    name = name.replace('عبد ', 'عبد')
    name = name.replace(' ابو ', ' ابو')
    return name

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    print("Loading existing data...")
    blocs_data = load_json(BLOCS_FILE)
    mps_data = load_json(MPS_FILE)

    # 1. Update Blocs.json for 'ordinary_1'
    print("Updating blocs.json for Session 1...")
    
    # Construct new blocs list for session 1
    new_session1_blocs = []
    
    for bloc_name, members in SESSION_1_BLOCS_RAW.items():
        info = BLOC_INFO_MAP.get(bloc_name, {})
        new_session1_blocs.append({
            "id": info.get("id", f"bloc_{len(new_session1_blocs)+1}"),
            "name": bloc_name,
            "totalSeats": len(members),
            "leadParty": info.get("leadParty", bloc_name),
            "color": info.get("color", "#6b7280"),
            "description": f"كتلة الدورة الأولى ل{bloc_name}."
        })
        
    # Find and update ordinary_1 session
    for session in blocs_data:
        if session["id"] == "ordinary_1":
            session["blocs"] = new_session1_blocs
            break
            
    save_json(BLOCS_FILE, blocs_data)
    print("Updated blocs.json successfully.")

    # 2. Update MPs.json memberships
    print("Updating MP memberships...")
    
    # Mapping normalized MP name -> MP object
    mp_map = {}
    for mp in mps_data:
        norm = normalize_name(mp["fullName"])
        mp_map[norm] = mp
        
        # Initialize memberships if missing
        if "memberships" not in mp:
            mp["memberships"] = []
            
        # CLEAR existing Session 1 memberships to avoid duplicates
        mp["memberships"] = [m for m in mp["memberships"] if m["session"] != "ordinary_1"]

    unmatched_mps = []
    matched_count = 0

    for bloc_name, member_names in SESSION_1_BLOCS_RAW.items():
        bloc_id = BLOC_INFO_MAP[bloc_name]["id"]
        
        for name in member_names:
            norm_name = normalize_name(name)
            
            # Try to match
            matched_mp = None
            
            # 1. Exact match on normalized full name
            if norm_name in mp_map:
                matched_mp = mp_map[norm_name]
            else:
                # 2. Fuzzy/Partial match
                # Check if 3 parts of the name match
                name_parts = set(norm_name.split())
                best_score = 0
                best_candidate = None
                
                for mp_norm, mp_obj in mp_map.items():
                    mp_parts = set(mp_norm.split())
                    common = name_parts.intersection(mp_parts)
                    if len(common) >= 3: # At least 3 names match (First, Father, Grandfather/Family)
                         if len(common) > best_score:
                             best_score = len(common)
                             best_candidate = mp_obj
                
                if best_candidate:
                    matched_mp = best_candidate

            if matched_mp:
                matched_mp["memberships"].append({
                    "session": "ordinary_1",
                    "bloc": bloc_name, # Storing name as requested by types or ID? 
                           # In previous step we used name for display, let's check types.ts
                           # Actually, let's store Name for consistency with frontend display logic
                    "startDate": "2024-11-18" 
                })
                matched_count += 1
            else:
                unmatched_mps.append(name)

    save_json(MPS_FILE, mps_data)
    print(f"Updated MPs.json successfully. Matched {matched_count} memberships.")
    
    if unmatched_mps:
        print(f"WARNING: Could not find {len(unmatched_mps)} MPs:")
        for m in unmatched_mps:
            print(f" - {m}")
    else:
        print("All MPs matched successfully!")

if __name__ == "__main__":
    main()
