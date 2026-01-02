#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Download MP photos using sequential ID pattern
Since we know RepresentativeID=2076 is for the first MP,
we'll try sequential IDs from there
"""

import json
import requests
import os
from pathlib import Path

def load_mps():
    """Load MPs from JSON file"""
    with open('public/data/mps.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_mps(mps):
    """Save MPs to JSON file"""
    with open('public/data/mps.json', 'w', encoding='utf-8') as f:
        json.dump(mps, f, ensure_ascii=False, indent=2)

def download_photo_by_id(rep_id, save_path):
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
    except Exception as e:
        pass
    return False

def main():
    print("=== MP Photo Download (Sequential ID Method) ===\n")
    
    # Load MPs
    mps = load_mps()
    print(f"Loaded {len(mps)} MPs\n")
    
    # Create images directory
    images_dir = Path('public/images/mps')
    images_dir.mkdir(parents=True, exist_ok=True)
    
    # We know RepresentativeID=2076 is for mp_001
    # Let's try sequential IDs from 2076
    base_id = 2076
    successful = 0
    failed = []
    
    print("Testing sequential ID pattern...")
    print("Starting from RepresentativeID 2076 for mp_001\n")
    
    for i, mp in enumerate(mps, start=1):
        mp_id = mp['id']
        rep_id = base_id + (i - 1)
        save_path = images_dir / f"{mp_id}.jpg"
        
        print(f"[{i}/138] Testing {mp_id} with RepID {rep_id}... ", end='')
        
        if download_photo_by_id(rep_id, save_path):
            mp['photoUrl'] = f"/images/mps/{mp_id}.jpg"
            successful += 1
            print("OK")
        else:
            failed.append(mp_id)
            print("FAILED")
        
        # Add small delay to avoid overwhelming the server
        if i % 10 == 0:
            print(f"Progress: {successful}/{i} successful\n")
    
    # Save updated mps.json
    save_mps(mps)
    
    print(f"\n=== RESULTS ===")
    print(f"Successful: {successful}/138")
    print(f"Failed: {len(failed)}")
    
    if successful > 100:
        print("\n[SUCCESS] Sequential pattern works! Most photos downloaded.")
    elif successful > 0:
        print(f"\n[PARTIAL] Sequential pattern partially works.")
        print(f"May need to adjust starting ID or handle gaps.")
    else:
        print("\n[FAILED] Sequential pattern doesn't work.")
        print("Need alternative approach.")

if __name__ == '__main__':
    main()
