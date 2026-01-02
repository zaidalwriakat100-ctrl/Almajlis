import json
import re
import json
import re
import difflib
import sys

def load_data(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_data(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    # Add newline at end of file to match standard POSIX
    with open(filepath, 'a', encoding='utf-8') as f:
        f.write('\n')

def parse_mp_block(block):
    lines = [l.strip() for l in block.split('\n') if l.strip()]
    data = {}
    
    current_key = None
    for line in lines:
        if line == "- الاسم":
            current_key = "name"
        elif line == "- المجالس النيابية المشارك بها":
            current_key = "councils"
        elif line == "- اللجان النيابية المشارك بها":
            current_key = "committees"
        elif line == "- الكتل النيابية المشارك بها":
            current_key = "blocs"
        elif line == "- لجان الأخوة المشارك بها":
            current_key = "brotherhood"
        elif line == "- جمعيات الصداقة المشارك بها":
            current_key = "friendship"
        elif line == "معلومات الاتصال":
            current_key = None
        elif line == "- هاتف المكتب":
            current_key = "phone"
        elif line == "- البريد الالكتروني":
            current_key = "email"
        elif line == "معلومات النائب":
            continue
        else:
            if current_key:
                if current_key in data:
                    data[current_key] += " " + line
                else:
                    data[current_key] = line
    
    return data

def parse_text_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by "معلومات النائب" which seems to be the start of each block
    # However, input has "معلومات النائب" at start. We can split by double newlines or look for the pattern.
    # The provided text has "معلومات النائب" as a header.
    
    blocks = re.split(r'معلومات النائب', content)
    parsed_mps = []
    for block in blocks:
        if not block.strip():
            continue
        mp_data = parse_mp_block(block)
        if mp_data and 'name' in mp_data:
            parsed_mps.append(mp_data)
    return parsed_mps

def normalize_name(name):
    # Remove titles
    titles = ["سعادة", "السيد", "الدكتور", "المهندس", "المحامي", "السيدة", "الآنسة", "الدكتورة", "المهندسة", "المحامية"]
    for title in titles:
        name = name.replace(title, "")
    # Remove extra spaces
    name = re.sub(r'\s+', ' ', name).strip()
    # Normalize alef
    name = re.sub(r'[أإآ]', 'ا', name)
    name = name.replace("ة", "ه") # common mismatch
    return name

def find_mp_by_name(name, mps_data):
    normalized_input = normalize_name(name)
    
    best_match = None
    highest_ratio = 0.0
    
    for mp in mps_data:
        # Check against fullName
        mp_name = mp.get('fullName', '')
        normalized_mp = normalize_name(mp_name)
        
        if normalized_input == normalized_mp:
            return mp
        
        ratio = difflib.SequenceMatcher(None, normalized_input, normalized_mp).ratio()
        if ratio > highest_ratio:
            highest_ratio = ratio
            best_match = mp
            
    if highest_ratio > 0.85: # Threshold for fuzzy match
        return best_match
    return None

def main():
    mps_path = 'public/data/mps.json'
    if len(sys.argv) > 1:
        input_path = sys.argv[1]
    else:
        input_path = 'mp_update_data.txt'
    
    try:
        mps = load_data(mps_path)
    except FileNotFoundError:
        print(f"Error: {mps_path} not found.")
        return

    parsed_data = parse_text_file(input_path)
    print(f"Found {len(parsed_data)} MPs in input text.")
    
    updated_count = 0
    
    for new_data in parsed_data:
        name = new_data.get('name')
        mp = find_mp_by_name(name, mps)
        
        if not mp:
            print(f"Warning: Could not find MP for '{name}'")
            continue
            
        updated_count += 1
        
        # Update email and phone
        if 'email' in new_data:
            mp['email'] = new_data['email'].strip()
        if 'phone' in new_data:
            mp['officePhone'] = new_data['phone'].strip()
            
        # Update Memberships (Committees and Blocs)
        # Parse committees string: "الدورة العادية الأولى - اللجان الدائمة / اللجنة القانونية/الدورة العادية الأولى - اللجان الدائمة / اللجنة الإدارية"
        # Parse blocs string: "الدورة العادية الأولى - كتلة حزب عزم/الدورة العادية الثانية - كتلة حزب عزم"
        
        # Helper to process session items
        def process_session_items(text, item_type):
            if not text or text == "لا يوجد":
                return
            
            # Split by '/' that is followed by 'الدورة' (start of new entry)
            # using regex lookahead.
            # Handles: "Session1 - Cat / Comm/Session2 - Cat / Comm"
            import re
            items = re.split(r'/(?=\s*الدورة)', text)
            
            for item in items:
                item = item.strip()
                if not item: continue
                
                parts = item.split(' - ')
                if len(parts) >= 2:
                    session_name_ar = parts[0].strip()
                     # If the part is just "Session - Category" (no committee), value is category
                    # If "Session - Category / Committee", splitting by ' - ' gives "Category / Committee" as last part
                    
                    if len(parts) > 2:
                         # Case where title might have dashes? Unlikely but possible.
                         # Generally "Session - Category / Committee" -> ["Session", "Category / Committee"]
                         value = " - ".join(parts[1:]).strip()
                    else:
                        value = parts[1].strip()

                    # Map session name to code
                    session_code = None
                    if "الدورة العادية الأولى" in session_name_ar:
                        session_code = "ordinary_1"
                    elif "الدورة العادية الثانية" in session_name_ar:
                        session_code = "ordinary_2"
                    
                    if session_code:
                        # Find or create session entry
                        session_entry = next((s for s in mp.get('memberships', []) if s['session'] == session_code), None)
                        if not session_entry:
                            session_entry = {'session': session_code}
                            if 'memberships' not in mp: mp['memberships'] = []
                            mp['memberships'].append(session_entry)
                        
                        if item_type == 'bloc':
                            session_entry['bloc'] = value
                        elif item_type == 'committee':
                            if 'committees' not in session_entry:
                                session_entry['committees'] = []
                            # Clean up committee name: "اللجان الدائمة / اللجنة القانونية" -> "اللجنة القانونية"
                            # But wait, earlier we saw: "الدورة... - اللجان الدائمة / اللجنة..."
                            # So value is "اللجان الدائمة / اللجنة..."
                            if "/" in value:
                                comm_name = value.split("/")[-1].strip()
                            else:
                                comm_name = value
                                
                            # FIX: Exclude "اللجان الدائمة" if it gets extracted incorrectly
                            if comm_name == "اللجان الدائمة":
                                return

                            # Remove "اللجان الدائمة" if it exists in the list (cleanup)
                            if "اللجان الدائمة" in session_entry['committees']:
                                session_entry['committees'].remove("اللجان الدائمة")

                            if comm_name not in session_entry['committees']:
                                session_entry['committees'].append(comm_name)

        if 'blocs' in new_data:
            process_session_items(new_data['blocs'], 'bloc')
            
        if 'committees' in new_data:
            process_session_items(new_data['committees'], 'committee')

        # Update Brotherhood and Friendship
        if 'brotherhood' in new_data and new_data['brotherhood'] != "لا يوجد":
             # Assuming these are simple lists or comma separated? The input example says "لا يوجد" mostly.
             # If there were multiple, they might be slash separated like others.
             items = [x.strip() for x in new_data['brotherhood'].split('/') if x.strip()]
             mp['brotherhoodCommittees'] = items

        if 'friendship' in new_data and new_data['friendship'] != "لا يوجد":
             items = [x.strip() for x in new_data['friendship'].split('/') if x.strip()]
             mp['friendshipAssociations'] = items

    print(f"Updated {updated_count} MPs.")
    save_data(mps_path, mps)

if __name__ == "__main__":
    main()
