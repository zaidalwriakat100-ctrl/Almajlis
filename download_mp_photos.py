#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to download MP photos from the official parliament website
and update mps.json with photo paths
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

def get_representative_id_from_website(mp_name):
    """
    Try to find RepresentativeID for an MP from the website
    This is a placeholder - we'll need the actual mapping
    """
    # For now, we'll use a simple ID pattern based on the URL you provided
    # RepresentativeID=2076 for the first MP
    # We need to determine the pattern or scrape IDs
    return None

def download_mp_photo(representative_id, save_path):
    """
    Download MP photo from parliament website
    Tries multiple URL patterns
    """
    # Possible URL patterns based on website analysis
    url_patterns = [
        f"https://www.representatives.jo/EBV4.0/Root_Storage/AR/Photo/{representative_id}.jpg",
        f"https://www.representatives.jo/EBV4.0/Root_Storage/EN/Photo/{representative_id}.jpg",
        f"https://www.representatives.jo/EBV4.0/Root_Storage/AR/EB_Images/Members/{representative_id}.jpg",
        f"https://www.representatives.jo/EBV4.0/Root_Storage/Images/Members/{representative_id}.jpg",
    ]
    
    for url in url_patterns:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200 and len(response.content) > 1000:  # Valid image
                with open(save_path, 'wb') as f:
                    f.write(response.content)
                print(f"[SUCCESS] Downloaded: {url}")
                return True
        except Exception as e:
            continue
    
    print(f"[FAILED] Could not download photo for ID {representative_id}")
    return False

def main():
    # Create images directory if it doesn't exist
    images_dir = Path('public/images/mps')
    images_dir.mkdir(parents=True, exist_ok=True)
    
    # Load MPs
    mps = load_mps()
    
    print(f"Starting photo download for {len(mps)} MPs...")
    print("\nNOTE: We need to map MP names to RepresentativeIDs")
    print("The URL you provided uses RepresentativeID=2076")
    print("We need to identify this pattern for all 138 MPs\n")
    
    # Test with the first MP (ID from your URL)
    # You mentioned RepresentativeID=2076 which is for the first MP
    test_representative_id = 2076
    test_save_path = images_dir / f"mp_001.jpg"
    
    print(f"Testing download for RepresentativeID {test_representative_id}...")
    if download_mp_photo(test_representative_id, test_save_path):
        print(f"\n[OK] Test successful! Photo saved to {test_save_path}")
        print("\nNext steps:")
        print("1. We need to map all 138 MPs to their RepresentativeIDs")
        print("2. Option A: Scrape the member list page to get all IDs")
        print("3. Option B: You provide the ID mapping")
        print("4. Then we can download all photos automatically")
    else:
        print("\n[INFO] Test download failed with current URL patterns")
        print("We may need to inspect the website more carefully")
        print("or use browser automation to extract photo URLs")

if __name__ == '__main__':
    main()
