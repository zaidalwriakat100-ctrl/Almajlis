#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Download remaining MP photos (88-138) by trying different RepresentativeID ranges
"""

import json
import requests
from pathlib import Path

def load_mps():
    """Load MPs from JSON file"""
    with open('public/data/mps.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_mps(mps):
    """Save MPs to JSON file"""
    with open('public/data/mps.json', 'w', encoding='utf-8') as f:
        json.dump(mps, f, ensure_ascii=False, indent=2)

def download_photo(rep_id, save_path):
    """Download a single photo by RepresentativeID"""
    photo_url = f"https://www.representatives.jo/RepresentativeImages/{rep_id}.jpg"
    
    try:
        response = requests.get(photo_url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        if response.status_code == 200 and len(response.content) > 1000:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
    except Exception:
        pass
    return False

def main():
    print("=== Completing Remaining MP Photos (88-138) ===\n")
    
    # Load MPs
    mps = load_mps()
    images_dir = Path('public/images/mps')
    images_dir.mkdir(parents=True, exist_ok=True)
    
    # Try different ID ranges for MPs 88-138
    # The gap might start at a different ID
    successful = 0
    
    # Strategy: Try different starting points
    possible_ranges = [
        (2163, "Sequential continuation"),  # Right after where we stopped
        (2200, "Round number after gap"),
        (2150, "Backtrack and fill gaps"),
        (2076, "Re-scan all IDs to find gaps"),
    ]
    
    print("Searching for remaining photos...\n")
    
    for mp in mps[87:]:  # Start from MP 88
        mp_id = mp['id']
        mp_num = int(mp_id.split('_')[1])
        save_path = images_dir / f"{mp_id}.jpg"
        
        # Skip if already downloaded
        if save_path.exists():
            mp['photoUrl'] = f"/images/mps/{mp_id}.jpg"
            successful += 1
            print(f"[SKIP] {mp_id} already exists")
            continue
        
        found = False
        
        # Try scanning a range of IDs around expected position
        # MPs might have non-sequential IDs
        base_guesses = [
            2076 + (mp_num - 1),  # Original sequential
            2163 + (mp_num - 88),  # After first batch
            2100 + mp_num,        # Different offset
            2000 + mp_num,        # Lower offset
        ]
        
        for rep_id in base_guesses:
            if download_photo(rep_id, save_path):
                mp['photoUrl'] = f"/images/mps/{mp_id}.jpg"
                successful += 1
                print(f"[OK] {mp_id} found at RepID {rep_id}")
                found = True
                break
        
        if not found:
            print(f"[MISS] {mp_id} not found in tested ranges")
    
    # Save updated mps.json
    save_mps(mps)
    
    print(f"\n=== RESULTS ===")
    print(f"Total photos now: {successful + 86}/138")
    print(f"Remaining: {138 - (successful + 86)}")

if __name__ == '__main__':
    main()
