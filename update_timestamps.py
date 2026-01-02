import json
import math

def update_timestamps():
    file_path = 'c:/Users/Ultimate/Downloads/jordan-parliament-monitor-(al-majlis) (10)/public/data/sessions.json'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        sessions = json.load(f)
    
    # Find Session 6
    target_session = None
    for session in sessions:
        if session['id'] == 'sess_2024_06_legislative':
            target_session = session
            break
            
    if not target_session:
        print("Session 6 not found")
        return

    segments = target_session.get('segments', [])
    
    # Starting parameters
    current_time = 0
    words_per_minute = 130
    
    updated_count = 0
    
    print(f"Processing {len(segments)} segments...")
    
    for i, segment in enumerate(segments):
        # Specific fix for known start points if any (override logic)
        # We respect existing non-zero timestamps if they seem strictly increasing
        existing_ts = segment.get('videoTimestamp', 0)
        
        # If existing timestamp is valid and ahead of current tracker, sync to it
        if existing_ts > current_time:
            current_time = existing_ts
        
        # Assign current time to segment
        segment['videoTimestamp'] = int(current_time)
        
        # Calculate duration based on text length
        text = segment.get('textExcerpt', '') or segment.get('sentence', '')
        word_count = len(text.split())
        
        # Minimum duration 30 seconds, otherwise based on word count
        duration_seconds = max(20, (word_count / words_per_minute) * 60)
        
        # Specific override for very short procedural segments
        if word_count < 10:
            duration_seconds = 10
            
        print(f"Seg {i}: {segment.get('speakerName')} at {int(current_time)}s (Duration: {int(duration_seconds)}s)")
        
        current_time += duration_seconds
        updated_count += 1

    # Save back
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(sessions, f, indent=4, ensure_ascii=False)
        
    print(f"Updated {updated_count} segments. Final time: {int(current_time/60)} minutes.")

if __name__ == "__main__":
    update_timestamps()
