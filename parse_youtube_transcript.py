
import json
import re
import os

# Configuration
MPS_FILE = 'public/data/mps.json'
TRANSCRIPT_FILE = 'sample_transcript.txt'
OUTPUT_FILE = 'transcript_segments.json'

def normalize_text(text):
    """Normalize Arabic text for comparison."""
    if not text:
        return ""
    text = text.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    text = text.replace("ة", "ه")
    text = text.replace("ى", "ي")
    text = re.sub(r'[^\w\s]', '', text) # Remove punctuation
    return text.strip()

def load_mps(filepath):
    """Load MPs and generate name variations for matching."""
    with open(filepath, 'r', encoding='utf-8') as f:
        mps = json.load(f)
    
    mp_map = {}
    for mp in mps:
        full_name = mp['fullName']
        norm_full = normalize_text(full_name)
        
        parts = full_name.split()
        variations = set()
        variations.add(norm_full)
        
        if len(parts) >= 2:
            # First + Last
            variations.add(normalize_text(f"{parts[0]} {parts[-1]}"))
        if len(parts) >= 3:
             # First + Second + Last
            variations.add(normalize_text(f"{parts[0]} {parts[1]} {parts[-1]}"))
            
        mp_map[mp['id']] = {
            'obj': mp,
            'variations': variations
        }
    return mp_map

def parse_transcript(transcript_path, mp_map):
    with open(transcript_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    segments = []
    current_speaker = "Unknown" # Initially unknown or 'Speaker of House'
    current_text = []
    current_start_time = "00:00"

    # Keywords that often precede or follow a name in a handover
    # invalid_starters = ["بسم", "والصلاة", "شكرا"] 

    full_text = ""
    for line in lines:
        # Extract timestamp if present (MM:SS)
        timestamp_match = re.match(r'\((\d{2}:\d{2})\)', line)
        line_text = line
        if timestamp_match:
            current_line_time = timestamp_match.group(1)
            line_text = line[timestamp_match.end():].strip()
        else:
            current_line_time = None
        
        full_text += " " + line_text.strip()
    
    # Heuristic splitting based on "Speaker Handover" patterns involves looking for keywords
    # followed by a matching MP name.
    # Common patterns: "النائب [Name] تفضل", "كلمة للنائب [Name]", "الدكتور [Name]"
    # But since text is continuous without clear breaks, we might need to look for specific phrases 
    # and split the text there.
    
    # We will look for transitions. A transition is usually short.
    # Let's iterate through words or look for known name matches in the text.
    
    # Optimized approach:
    # 1. Search for all name variations in the text.
    # 2. Filter for those that look like a "call to speak" (e.g. preceded/followed by "تفضل", "الكلمة", "النائب").
    # 3. Use those indices to split the text.

    normalized_full_text = normalize_text(full_text)
    
    # Find all occurrences of MP names
    matches = []
    for mp_id, data in mp_map.items():
        for name_var in data['variations']:
            # We want to find this name in the text
            # Use regex to find start indices
            # \b is word boundary (might be tricky with non-normalized text, so we search in normalized)
            # But we need original indices.
            
            # Let's simplify: scan the normalized text, map back to roughly original if possible, 
            # OR just segment the normalized text for now (User just wants structured data).
            # Actually, we need the original text for the content.
            
            # Regex search in normalized text
            pattern = re.escape(name_var)
            for m in re.finditer(pattern, normalized_full_text):
                # Context check: is it a handover?
                # Look at ~20 chars before and after
                start = max(0, m.start() - 30)
                end = min(len(normalized_full_text), m.end() + 30)
                context = normalized_full_text[start:end]
                
                # Keywords indicating a turn switch
                keywords = ["تفضل", "تفضلي", "كلمه", "النائب", "الدكتور", "المهندس", "اخ", "اخت"]
                if any(kw in context for kw in keywords):
                    matches.append({
                        'mp_id': mp_id,
                        'name_found': name_var,
                        'start_index': m.start(),
                        'end_index': m.end()
                    })
    
    # Sort matches by position
    matches.sort(key=lambda x: x['start_index'])
    
    # Deduplicate overlapping matches (longest match wins)
    unique_matches = []
    if matches:
        current_match = matches[0]
        for next_match in matches[1:]:
            if next_match['start_index'] < current_match['end_index']:
                # Overlap
                if (next_match['end_index'] - next_match['start_index']) > (current_match['end_index'] - current_match['start_index']):
                    current_match = next_match
            else:
                unique_matches.append(current_match)
                current_match = next_match
        unique_matches.append(current_match)
    
    # Now build segments
    # Note: We are working with indices in 'normalized_full_text', which maps 1:1 to characters 
    # only if normalization didn't change length.
    # My normalization removed punctuation, so length changed!
    # Providing indices for original text is hard with this method.
    
    # ALTERNATIVE: Token-based sliding window over the *original* text words.
    # 1. Tokenize original text.
    # 2. Normalize tokens for matching.
    # 3. Check for sequences matching names.
    pass

    # Simple implementation for this first pass:
    # Just iterate line by line? No, lines are arbitrary.
    # Let's stick to regex on the original text but normalize the search pattern.
    # AND normalize the text segment being checked on the fly? No too slow.
    
    # Let's clean the full text *very lightly* for the index mapping to stay close?
    # Or just don't rely on strict indices yet.
    
    # Let's try searching for the names in the original text (with loose regex for common Arabic variations).
    
    return process_with_regex(full_text, mp_map)

def process_with_regex(full_text, mp_map):
    segments = []
    
    # Build huge regex for all names?
    # Better: iterate through text, identifying potential "Speaker: " patterns.
    # The text provided has "Speaker Name: " sometimes implicitly.
    # But mostly it's continuous: "... thank you. Now Mr. X please go ahead. بسم الله ..."
    
    # Let's regex for "keyword + name + keyword" pattern
    # Keywords: ("النائب" | "الدكتور" | "المهندس" | "السيد" | "السيدة" | "الزميل" | "الزميلة")
    # Followed by (Name)
    # Followed by ("تفضل" | "تفضلي" | "بداية" | "بسم الله")
    
    titles = r"(النائب|الدكتور|الدكتورة|المهندس|المهندسة|السيد|السيدة|الزميل|الزميلة|المحترم|المحترمة|سعادة)"
    keywords_after = r"(تفضل|تفضلي|كلمة)"
    
    # Construct a list of all normalized name variations to check against
    # This is O(N*M) where N is text length and M is number of MPs. 
    # Text is small (~1hr session), M=138. Should be fast enough.
    
    found_transitions = []
    
    # Normalize full text for searching, but keep map to original indices? 
    # Python's regex on the original text is best if we handle the variations in the regex.
    # e.g. "أحمد" becomes "[أاإآ]حمد" in regex.
    
    def make_regex(text):
        text = text.replace("ا", "[أاإآ]")
        text = text.replace("ه", "[هة]")
        text = text.replace("ي", "[يى]")
        return text

    # Search for each MP
    for mp_id, data in mp_map.items():
        for name_var in data['variations']:
            # Create loose regex for this name
            parts = name_var.split()
            # Join parts with \s+ to allow multiple spaces/newlines
            # apply character mapping
            parts_regex = [make_regex(p) for p in parts]
            name_pattern = r"\s+".join(parts_regex)
            
            # Look for specific intro pattern
            # "Title? Name Title? (Tifadl/Tifadli)" OR "(Tifadl/Tifadli) Title? Name"
            # We want to be reasonably specific to avoid just mentioning a name in a speech.
            
            # Pattern 1: Title + Name ... Tifadl
            p1 = f"{titles}\s+{name_pattern}.{{0,20}}{keywords_after}"
            # Pattern 2: Tifadl ... Title + Name
            p2 = f"{keywords_after}.{{0,20}}{titles}?\s?{name_pattern}"
             # Pattern 3: Explicit "Suaadat..." before name
            p3 = f"سعادة\s+{titles}?\s?{name_pattern}"

            combined_pattern = f"({p1}|{p2}|{p3})"
            
            for m in re.finditer(combined_pattern, full_text):
                found_transitions.append({
                    'mp_id': mp_id,
                    'name_match': name_var,
                    'start': m.start(),
                    'end': m.end(),
                    'match_text': m.group()
                })

    # Sort and filter
    found_transitions.sort(key=lambda x: x['start'])
    
    # Remove overlapping
    if not found_transitions:
        return []

    unique = []
    curr = found_transitions[0]
    for nxt in found_transitions[1:]:
        if nxt['start'] < curr['end']:
            # Overlap: keep the one that matches more specific name (longer) or verified keyword
            if len(nxt['name_match']) > len(curr['name_match']):
                curr = nxt
        else:
            unique.append(curr)
            curr = nxt
    unique.append(curr)
    
    # Now assume text between transitions belongs to the PREVIOUS speaker.
    # First segment: Start to first transition (Speaker of House / Admin)
    # Then each transition starts a new speaker.
    
    segments = []
    last_idx = 0
    last_speaker_id = "presiding_officer" # Chairperson
    
    for trans in unique:
        # Text from last_idx to trans['start'] belongs to last_speaker
        segment_text = full_text[last_idx:trans['start']].strip()
        if segment_text:
            segments.append({
                'speaker_id': last_speaker_id,
                'text': segment_text,
                'start_char': last_idx,
                'end_char': trans['start']
            })
        
        # The transition phrase itself often contains the handover, but the actual speech starts AFTER it.
        # But sometimes the transition phrase *is* the only thing said by the chair.
        # Let's assign the transition phrase to the Presiding Officer?
        # Or usually the Presiding officer says "Suaadat X Tafadal". Then X starts.
        # So text of transition -> Presiding Officer.
        # Then next segment -> MP.
        
        segments.append({
            'speaker_id': "presiding_officer",
            'text': full_text[trans['start']:trans['end']].strip(),
            'start_char': trans['start'],
            'end_char': trans['end']
        })
        
        last_idx = trans['end']
        last_speaker_id = trans['mp_id']
        
    # Final segment
    segments.append({
        'speaker_id': last_speaker_id,
        'text': full_text[last_idx:].strip(),
        'start_char': last_idx,
        'end_char': len(full_text)
    })
    
    return segments

if __name__ == "__main__":
    mps = load_mps(MPS_FILE)
    segments = parse_transcript(TRANSCRIPT_FILE, mps)
    
    output = []
    for s in segments:
        # Enrich with name
        name = "Presiding Officer"
        if s['speaker_id'] != "presiding_officer":
             mp = mps.get(s['speaker_id'])
             if mp:
                 name = mp['obj']['fullName']
             else:
                 name = "Unknown MP"
        
        output.append({
            'speaker': name,
            'mp_id': s['speaker_id'],
            'text': s['text'][:100] + "..." if len(s['text']) > 100 else s['text'] # Preview
        })
        
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"Processed {len(segments)} segments. Check {OUTPUT_FILE}")
