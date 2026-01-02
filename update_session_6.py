import json
import os
import re
from datetime import datetime
import difflib

# Constants
TRANSCRIPT_FILE = r"c:\Users\Ultimate\Downloads\jordan-parliament-monitor-(al-majlis) (10)\transcripts\الجلسة السادسة - تشريعية - اليوم الاثنين 20241230.txt"
MPS_FILE = r"c:\Users\Ultimate\Downloads\jordan-parliament-monitor-(al-majlis) (10)\public\data\mps.json"
SESSIONS_FILE = r"c:\Users\Ultimate\Downloads\jordan-parliament-monitor-(al-majlis) (10)\public\data\sessions.json"

def normalize_text(text):
    """Normalize Arabic text for comparison."""
    if not text: return ""
    text = str(text)
    # Remove diacritics
    text = re.sub(r'[\u064B-\u065F]', '', text)
    # Normalize Alef
    text = text.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    # Normalize Teh Marbuta
    text = text.replace("ة", "ه")
    # Normalize Alef Maqsura
    text = text.replace("ى", "ي")
    return text.strip()

def load_mps():
    with open(MPS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_mp_id_by_name(name, mps):
    """Find MP ID by fuzzy matching the name."""
    norm_name = normalize_text(name)
    best_ratio = 0
    best_id = "unknown"
    
    for mp in mps:
        mp_name = normalize_text(mp['fullName'])
        # Check for direct substring match
        if norm_name in mp_name or mp_name in norm_name:
            return mp['id']
            
        # Fallback to similarity ratio
        ratio = difflib.SequenceMatcher(None, norm_name, mp_name).ratio()
        if ratio > best_ratio and ratio > 0.6: # Threshold
            best_ratio = ratio
            best_id = mp['id']
            
    return best_id

def extract_segments(text, mps):
    """
    Extract segments using token scanning.
    Scans for 'Tafadal'/'Al-Kalima' and finds speaker name in surrounding tokens.
    """
    # 1. Pre-processing
    # Remove timestamps first
    text = re.sub(r'\(\d{0,2}:?\d{2}:\d{2}\)', '', text)
    
    # Titles to ignore when finding name
    titles = {"سعادة", "معالي", "الزميل", "الزميلة", "الاخ", "الأخ", "النائب", "الدكتور", "الدكتورة", "المهندس", "المهندسة", "السيد", "السيدة", "الشيخ", "اخ", "أخ", "يا", "ال"}
    
    # 2. Tokenize
    # regex to find words and their positions
    tokens = []
    for m in re.finditer(r"[\u0600-\u06FF0-9]+", text):
        tokens.append({
            "text": m.group(0),
            "start": m.start(),
            "end": m.end()
        })
        
    transitions = []
    
    # 3. Scan tokens
    i = 0
    while i < len(tokens):
        token = tokens[i]
        word = token['text']
        
        # Check for Handover Keywords
        is_handover = False
        
        if word in ["تفضل", "فليتفضل"]:
            is_handover = True
        elif word == "الكلمة" and i+1 < len(tokens) and tokens[i+1]['text'] == "ل":
             is_handover = True
             i += 1 
             
        if is_handover:
            # SEARCH FOR SPEAKER NAME
            # Strategy: Look AHEAD first (Prefix). "Tafadal Akh Yanal"
            
            detected_name = []
            scan_limit = min(len(tokens), i + 15)
            
            curr_j = i + 1
            
            valid_name_parts = []
            
            for j in range(curr_j, scan_limit):
                t = tokens[j]
                w = t['text']
                
                # If we hit another keyword, stop
                if w in ["تفضل", "شكرا", "بسم", "السلام"]:
                    break
                    
                # If numeric, skip 
                if w.isdigit(): 
                    continue
                    
                # If title/preposition, skip
                if w in titles:
                    continue
                    
                # If short word likely noise? "من", "عن"
                if len(w) < 3 and w not in ["بن", "بو"]: 
                     continue
                     
                # Candidate name part
                valid_name_parts.append(w)
                if len(valid_name_parts) >= 3: 
                    break
            
            if valid_name_parts:
                full_name_candidate = " ".join(valid_name_parts)
                transitions.append({
                    "idx": token['start'], # Start of "Tafadal"
                    "speaker": full_name_candidate,
                    "tokens_idx": i
                })
                i = curr_j + len(valid_name_parts)
                continue
                
            # If lookahead failed, check LOOKBEHIND (Suffix Pattern)
            # "Saadat Al-Naib X Tafadal"
            valid_name_parts = []
            start_search = max(0, i - 10)
            
            for k in range(i-1, start_search, -1):
                t = tokens[k]
                w = t['text']
                
                if w in ["تفضل", "شكرا", "بسم", "السلام"]:
                    break 
                
                if w.isdigit() or w in titles or len(w) < 2:
                    continue
                    
                valid_name_parts.insert(0, w)
                if len(valid_name_parts) >= 3:
                    break
            
            if valid_name_parts:
                 full_name_candidate = " ".join(valid_name_parts)
                 transitions.append({
                    "idx": token['start'], # Start of "Tafadal"
                    "speaker": full_name_candidate,
                    "tokens_idx": i
                })
        
        i += 1

    # 4. Filter and Create Segments
    segments = []
    start_idx = 0
    start_speaker = "رئيس المجلس"
    
    transitions.sort(key=lambda x: x['idx'])
    
    unique_trans = []
    if transitions:
        curr = transitions[0]
        for t in transitions[1:]:
            if t['idx'] - curr['idx'] < 50: 
               continue
            unique_trans.append(curr)
            curr = t
        unique_trans.append(curr)
    
    for t in unique_trans:
        chunk = text[start_idx:t['idx']].strip()
        if len(chunk) > 10:
             segments.append({ "speakerName": start_speaker, "text": chunk })
        
        # Identify start of NEW speech
        new_start = min(len(text), t['idx'] + 50)
        
        intro_text = text[t['idx']:new_start]
        if segments and segments[-1]['speakerName'] == "رئيس المجلس":
            segments[-1]['text'] += " " + intro_text
        else:
            segments.append({ "speakerName": "رئيس المجلس", "text": intro_text })
            
        start_idx = new_start
        start_speaker = t['speaker']

    final_chunk = text[start_idx:].strip()
    if len(final_chunk) > 10:
        segments.append({ "speakerName": start_speaker, "text": final_chunk })

    # 5. Formatter
    final_output_segments = []
    count = 1
    
    for seg in segments:
        name = seg['speakerName']
        # Cleanup
        name = re.sub(r"^(يا|اخ|زميل|الاخ|الزميل|سعادة|معالي|النائب)\s+", "", name).strip()
        name = re.sub(r"\d+", "", name).strip()
        
        mp_id = get_mp_id_by_name(name, mps)
        role = "نائب"
        
        if "رئيس" in name or "الرئيس" in name: 
               role = "رئيس المجلس"
               name = "أحمد الصفدي"
               mp_id = "mp_013"
        elif mp_id == "mp_013": 
               role = "رئيس المجلس"
               name = "أحمد الصفدي"
        
        text_content = seg['text']
        
        # --- IMPROVED SUMMARIZATION LOGIC ---
        
        # 1. Clean Filler
        # Phrases to remove from start of summary
        fillers = [
            "بسم الله الرحمن الرحيم",
             "والصلاه والسلام على",
             "شكرا سعاده الرئيس", 
             "شكرا سيدي الرئيس",
             "شكرا معالي الرئيس",
             "سيدي الرئيس",
             "سعادة الرئيس",
             "الزملاء المحترمين",
             "زملائي الاعزاء",
             "صباح الخير",
             "يعطيك العافيه",
             "تفضل",
             "شكرا",
             "بدايه"
        ]
        
        clean_text = text_content
        # Remove timestamps again just in case
        clean_text = re.sub(r'\(\d{2}:\d{2}\)', '', clean_text)
        
        # Deduplicate spaces
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        # Remove fillers from logical start
        # Iterate multiple times to clean stacked fillers "Shukran Saadat ... Bismillah ..."
        for _ in range(3):
            for filler in fillers:
                if clean_text.startswith(filler):
                    clean_text = clean_text[len(filler):].strip()
                    # Also handle "wa" (and) connector? "wa Shukran"
                    if clean_text.startswith("و "):
                         clean_text = clean_text[2:].strip()
        
        # 2. Extract Key Sentences
        # Split by punctuation (Arabic comma, dot, newline)
        raw_sentences = re.split(r'[.،\n\t]+', clean_text)
        sentences = [s.strip() for s in raw_sentences if len(s.strip()) > 10]
        
        # Keywords for "Action" or "Important" sentences
        keywords = ["اطالب", "نطالب", "اقترح", "يجب", "مشكلة", "فساد", "تجاوز", "سؤال", "استجواب", "الموازنة", "تقرير", "ديوان"]
        
        selected_bullets = []
        
        # Prioritize sentences with keywords
        for s in sentences:
            if any(k in s for k in keywords):
                selected_bullets.append(s)
                
        # If no keyword sentences found, take the first 2 meaningful sentences
        if not selected_bullets:
             selected_bullets = sentences[:2]
        
        # Limit to 3 bullets max
        final_bullets = selected_bullets[:3]
        
        # If still empty (very short text?), just take the whole clean text
        if not final_bullets:
             final_bullets = [clean_text[:100]]

        # --- END IMPROVEMENT ---
        
        stance = "حيادي"
        if any(w in text_content for w in ["فساد", "خلل", "تجاوز", "سرقة", "محاسبة", "ضعف", "تراجع"]):
             stance = "معارض"
        elif any(w in text_content for w in ["شكر", "تقدير", "انجاز", "جهود", "ثمن"]):
             stance = "مؤيد"
             
        final_output_segments.append({
            "id": f"seg_{count:03d}",
            "speakerName": name,
            "speakerId": mp_id,
            "speakerRole": role,
            "textExcerpt": clean_text[:150] + "..." if len(clean_text) > 150 else clean_text,
            "fullText": clean_text,
            "topics": ["مناقشة عامة"],
            "stanceTowardGovernment": stance,
            "summaryBullets": final_bullets
        })
        count += 1
        
    return final_output_segments

def main():
    print("Reading Transcript...")
    with open(TRANSCRIPT_FILE, 'r', encoding='utf-8') as f:
        text = f.read()

    print("Loading MPs...")
    mps = load_mps()
    
    print("Extracting Segments...")
    segments = extract_segments(text, mps)
    print(f"Extracted {len(segments)} segments.")
    
    session_data = {
        "id": "sess_2024_06_legislative",
        "date": "2024-12-30",
        "title": "الجلسة السادسة - تشريعية - مناقشة تقرير ديوان المحاسبة",
        "type": "legislative",
        "ordinaryTerm": 2, 
        "agendaSummary": "مناقشة تقرير ديوان المحاسبة لعام 2023.",
        "minutesUrl": "https://www.youtube.com/watch?v=iHRNlpY7dbM",
        "source": "YouTube Transcript",
        "lastUpdated": datetime.now().isoformat(),
        "analysisStatus": "ready",
        "youtubeVideoId": "iHRNlpY7dbM",
        "sessionOverview": {
            "summaryBullets": [
                "بدأ المجلس بقراءة الفاتحة وتهنئة جلالة الملك والشعب بالعام الجديد.",
                "ناقش المجلس تقرير ديوان المحاسبة لعام 2023.",
                "مداخلات نيابية مكثفة تطالب بمحاسبة الفساد وتحويل التقرير للجنة المالية والقانونية والنائب العام.",
                "انتقادات للترهل الإداري والمخالفات في الشركات الحكومية والجامعات.",
                "إشادة بدور ديوان المحاسبة كذراع رقابي للمجلس."
            ],
            "mainTopics": [
                "تقرير ديوان المحاسبة 2023",
                "الفساد الإداري والمالي",
                "إحالة التقرير للجنة المالية",
                "الشركات الحكومية",
                "المستشفيات والجامعات"
            ],
            "keyLawsOrFiles": [
                "تقرير ديوان المحاسبة لسنة 2023"
            ]
        },
        "segments": segments
    }
    
    print("Updating sessions.json...")
    with open(SESSIONS_FILE, 'r', encoding='utf-8') as f:
        all_sessions = json.load(f)
        
    updated = False
    for i, s in enumerate(all_sessions):
        if s['id'] == session_data['id'] or "20241230" in s.get('title', ''):
            all_sessions[i] = session_data
            updated = True
            print("Replaced existing session entry.")
            break
            
    if not updated:
        all_sessions.append(session_data)
        print("Added new session entry.")
        
    with open(SESSIONS_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_sessions, f, ensure_ascii=False, indent=2)
        
    print("Done.")

if __name__ == "__main__":
    main()
