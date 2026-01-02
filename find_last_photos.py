#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Find the last 2 missing MP photos by scanning ID ranges
"""

import json
import requests
from pathlib import Path

def load_mps():
    with open('public/data/mps.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_mps(mps):
    with open('public/data/mps.json', 'w', encoding='utf-8') as f:
        json.dump(mps, f, ensure_ascii=False, indent=2)

def download_photo(rep_id, save_path):
    photo_url = f"https://www.representatives.jo/RepresentativeImages/{rep_id}.jpg"
    try:
        response = requests.get(photo_url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        if response.status_code == 200 and len(response.content) > 1000:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
    except:
        pass
    return False

def main():
    print("=== Finding Last 2 MP Photos ===\n")
    
    mps = load_mps()
    images_dir = Path('public/images/mps')
    
    # mp_045 and mp_120
    missing_mps = [
        ('mp_045', 45, [2120, 2045, 2075, 2076+44, 2119, 2121]),  # Try nearby IDs
        ('mp_120', 120, [2120, 2196, 2195, 2076+119, 2119, 2121])  # Already tried sequential
    ]
    
    found = 0
    
    for mp_id, mp_num, id_guesses in missing_mps:
        save_path = images_dir / f"{mp_id}.jpg"
        
        if save_path.exists():
            print(f"[SKIP] {mp_id} already exists")
            continue
        
        print(f"\nSearching for {mp_id}...")
        success = False
        
        # Try a wider range
        test_ids = id_guesses + list(range(2040, 2150))
        tested = set()
        
        for rep_id in test_ids:
            if rep_id in tested:
                continue
            tested.add(rep_id)
            
            if download_photo(rep_id, save_path):
                print(f"[SUCCESS] {mp_id} found at RepID {rep_id}!")
                # Update mps.json
                mp = next(m for m in mps if m['id'] == mp_id)
                mp['photoUrl'] = f"/images/mps/{mp_id}.jpg"
                found += 1
                success = True
                break
        
        if not success:
            print(f"[FAILED] {mp_id} not found in tested range")
    
    if found > 0:
        save_mps(mps)
        print(f"\n[UPDATED] mps.json with {found} new photo(s)")
    
    total = 136 + found
    print(f"\n=== FINAL RESULTS ===")
    print(f"Total photos: {total}/138")
    if total == 138:
        print("🎉 ALL 138 MPs HAVE PHOTOS! 🎉")
    else:
        print(f"Remaining: {138 - total} MP(s)")

if __name__ == '__main__':
    main()
