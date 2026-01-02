import json
import re
import os

# Configuration
TRANSCRIPT_PATH = r"transcripts/الجلسة السادسة_ الدورة العادية الثانية.txt"
SESSIONS_PATH = r"public/data/sessions.json"
TARGET_SESSION_ID = "sess_2025_06_legislative" # Assuming 2025 for 2nd Term based on context
TARGET_TITLE = "الجلسة السادسة - الدورة العادية الثانية"
TARGET_DATE = "2025-12-30" # Placeholder, or derived from file content if possible, keeping consistent with user's future timeline
TARGET_TERM = 2
TARGET_SUMMARY = "مناقشة مشاريع القوانين المدرجة على جدول أعمال الدورة العادية الثانية."

def parse_transcript(file_path):
    segments = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"Error: Transcript file not found at {file_path}")
        return []

    segment_id_counter = 1
    current_speaker = None
    current_text_lines = []
    current_timestamp = 0

    def save_segment():
        nonlocal segment_id_counter
        if current_speaker and current_text_lines:
            full_text = " ".join(current_text_lines).strip()
            if not full_text: return

            # Determine Role
            role = "MP"
            if "رئيس المجلس" in current_speaker or "الرئيس" == current_speaker:
                role = "Speaker"
            elif "الأمين العام" in current_speaker:
                role = "Secretary" 
            elif "رئيس الوزراء" in current_speaker or "وزير" in current_speaker:
                role = "Government"
            
            # Extract Topics (simple keyword matching)
            topics = []
            if "ديوان المحاسبة" in full_text: topics.append("ديوان المحاسبة")
            if "فساد" in full_text: topics.append("مكافحة الفساد")
            if "مياه" in full_text or "المياه" in full_text: topics.append("المياه")
            if "كهرباء" in full_text or "الكهرباء" in full_text: topics.append("الكهرباء")
            if "غزة" in full_text or "فلسطين" in full_text: topics.append("فلسطين")
            if "عمال" in full_text or "المياومة" in full_text: topics.append("العمل والعمال")
            if "زراعة" in full_text: topics.append("الزراعة")
            if "بلديات" in full_text or "البلدية" in full_text: topics.append("البلديات")


            segment = {
                "id": f"{TARGET_SESSION_ID}_{segment_id_counter}",
                "speakerName": current_speaker,
                "speakerRole": role,
                "textExcerpt": full_text[:300] + "..." if len(full_text) > 300 else full_text,
                "sentence": full_text,
                "videoTimestamp": current_timestamp,
                "topics": topics,
                "stanceTowardGovernment": "neutral"
            }
            segments.append(segment)
            segment_id_counter += 1

    for line in lines:
        line = line.strip()
        if not line: continue
        
        # Check for Speaker (ends with colon)
        # Use regex to be safer? Or just simple string check.
        # Most lines are explicitly "Speaker Name:"
        # Some timestamp lines might look like text.
        
        if line.endswith(":") and len(line) < 100:
            # Save previous segment
            save_segment()
            
            # Start new segment
            current_speaker = line[:-1].strip() # Remove colon
            current_text_lines = []
            current_timestamp = 0 # Default if no timestamp found in next line
        
        elif line.startswith("Transcript:") or line.startswith("الدورة العادية"):
             continue # Skip headers
             
        else:
            # It's text
            # Check for timestamp at start (MM:SS) or (HH:MM:SS) inside parens usually
            # Example: (00:34) Text...
            # Regex for (\d{1,2}:\d{2}) or similar
            timestamp_match = re.search(r'\((\d{1,2}:\d{2}(?::\d{2})?)\)', line)
            if timestamp_match and not current_timestamp:
                time_str = timestamp_match.group(1)
                parts = time_str.split(':')
                seconds = 0
                if len(parts) == 2: # MM:SS
                    seconds = int(parts[0]) * 60 + int(parts[1])
                elif len(parts) == 3: # HH:MM:SS
                    seconds = int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
                current_timestamp = seconds
                
                # We typically remove the timestamp from text or keep it? 
                # User usually sees clean text. Let's keep it in sentence for context but maybe clean excerpt?
                # For now keeping it is fine as it's part of the raw transcript.
                
            current_text_lines.append(line)

    # Save last segment
    save_segment()
        
    return segments

def update_sessions_json(new_segments):
    if not os.path.exists(SESSIONS_PATH):
        print(f"Error: Sessions file not found at {SESSIONS_PATH}")
        return

    try:
        with open(SESSIONS_PATH, 'r', encoding='utf-8') as f:
            sessions = json.load(f)
    except json.JSONDecodeError:
        print("Error: Failed to decode sessions.json")
        return

    # Find and update
    found = False
    for session in sessions:
        if session.get('id') == TARGET_SESSION_ID:
            print(f"Found existing session: {session.get('title')}")
            session['title'] = TARGET_TITLE
            session['date'] = TARGET_DATE
            session['ordinaryTerm'] = TARGET_TERM
            session['segments'] = new_segments
            session['analysisStatus'] = "ready"
            found = True
            break
            
    if not found:
        print("Creating new session entry.")
        new_session = {
            "id": TARGET_SESSION_ID,
            "title": TARGET_TITLE,
            "date": TARGET_DATE,
            "ordinaryTerm": TARGET_TERM,
            "agendaSummary": TARGET_SUMMARY,
            "segments": new_segments,
            "analysisStatus": "ready",
            "videoUrl": "",
            "thumbnailUrl": "/images/sessions/session-6-thumb.jpg"
        }
        sessions.append(new_session)

    # Filter duplicates/placeholders
    sessions = [s for s in sessions if "sample_transcript.txt" not in s.get('title', '')]
    
    with open(SESSIONS_PATH, 'w', encoding='utf-8') as f:
        json.dump(sessions, f, ensure_ascii=False, indent=4)
    
    print("Successfully updated sessions.json")

if __name__ == "__main__":
    segments = parse_transcript(TRANSCRIPT_PATH)
    print(f"Parsed {len(segments)} segments.")
    if segments:
        update_sessions_json(segments)
