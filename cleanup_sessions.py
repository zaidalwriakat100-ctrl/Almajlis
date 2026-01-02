
import json
import os

file_path = 'public/data/sessions.json'

with open(file_path, 'r', encoding='utf-8') as f:
    sessions = json.load(f)

# IDs to keep (original + latest one)
# I will filter out the specific test run IDs I know are bad/duplicates
bad_ids = [
    "sess_20251220_012547",
    "sess_20251220_012715",
    "sess_20251220_012916",
    "sess_20251220_013254"
]

# Keep sessions that are NOT in the bad_ids list
cleaned_sessions = [s for s in sessions if s['id'] not in bad_ids]

print(f"Original count: {len(sessions)}")
print(f"Cleaned count: {len(cleaned_sessions)}")

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(cleaned_sessions, f, ensure_ascii=False, indent=2)

print("Cleanup complete.")
