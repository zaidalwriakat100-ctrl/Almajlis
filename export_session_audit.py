import json
import csv

def export_segments_to_csv():
    json_path = 'c:/Users/Ultimate/Downloads/jordan-parliament-monitor-(al-majlis) (10)/public/data/sessions.json'
    csv_path = 'c:/Users/Ultimate/Downloads/jordan-parliament-monitor-(al-majlis) (10)/session_6_data_audit.csv'

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            sessions = json.load(f)

        session_6 = next((s for s in sessions if s['id'] == 'sess_2024_06_legislative'), None)
        if not session_6:
            print("Session 6 not found.")
            return

        segments = session_6.get('segments', [])

        with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.writer(f)
            # Header
            writer.writerow([
                'Segment_Order',
                'Current_Speaker_Name',
                'Text_Excerpt (First 50 chars)',
                'Current_Timestamp_Estimate (Seconds)',
                'CORRECT_SPEAKER_NAME (Please Edit)',
                'CORRECT_START_TIME (HH:MM:SS) (Please Edit)'
            ])

            for i, seg in enumerate(segments):
                text_preview = seg.get('textExcerpt', '')[:50] + "..."
                writer.writerow([
                    i + 1,
                    seg.get('speakerName', ''),
                    text_preview,
                    seg.get('videoTimestamp', 0),
                    seg.get('speakerName', ''), # Default to current
                    '' # Empty for user to fill
                ])
        
        print(f"Successfully exported {len(segments)} segments to {csv_path}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    export_segments_to_csv()
