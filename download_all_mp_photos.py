#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scrape RepresentativeIDs from parliament website and download MP photos
"""

import json
import requests
from bs4 import BeautifulSoup
import os
from pathlib import Path
import re

def load_mps():
    """Load MPs from JSON file"""
    with open('public/data/mps.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def scrape_representative_ids():
    """
    Scrape RepresentativeIDs from parliament member list page
    Returns dict mapping cleaned MP names to RepresentativeIDs
    """
    url = "https://www.representatives.jo/Ar/Pages/CouncilMembers"
    
    try:
        print("Fetching member list page...")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all links to member detail pages
        member_links = soup.find_all('a', href=re.compile(r'RepresentativeID=\d+'))
        
        id_mapping = {}
        for link in member_links:
            # Extract RepresentativeID
            match = re.search(r'RepresentativeID=(\d+)', link['href'])
            if match:
                rep_id = match.group(1)
                # Extract name from link text or nearby elements
                name = link.get_text(strip=True)
                if name:
                    # Clean the name
                    name = name.replace('سعادة السيد', '').replace('سعادة النائب', '').strip()
                    id_mapping[name] = rep_id
        
        print(f"Found {len(id_mapping)} RepresentativeIDs")
        return id_mapping
        
    except Exception as e:
        print(f"Error scraping: {e}")
        return {}

def normalize_name(name):
    """Normalize MP name for matching"""
    # Remove common prefixes
    name = name.replace('سعادة السيد', '').replace('سعادة النائب', '').strip()
    # Remove extra spaces
    name = ' '.join(name.split())
    return name

def match_mps_to_ids(mps, id_mapping):
    """
    Match MPs from our database to RepresentativeIDs from website
    Returns dict mapping mp_id to RepresentativeID
    """
    matches = {}
    unmatched = []
    
    for mp in mps:
        mp_name = normalize_name(mp['fullName'])
        matched = False
        
        # Try exact match first
        if mp_name in id_mapping:
            matches[mp['id']] = id_mapping[mp_name]
            matched = True
        else:
            # Try partial matching
            for web_name, rep_id in id_mapping.items():
                if mp_name in web_name or web_name in mp_name:
                    matches[mp['id']] = rep_id
                    matched = True
                    break
        
        if not matched:
            unmatched.append(mp_name)
    
    print(f"Matched: {len(matches)}/138")
    if unmatched:
        print(f"Unmatched ({len(unmatched)}): {unmatched[:5]}...")
    
    return matches

def download_photos(mp_id_mapping):
    """
    Download photos for all MPs using RepresentativeIDs
    """
    # Create images directory
    images_dir = Path('public/images/mps')
    images_dir.mkdir(parents=True, exist_ok=True)
    
    successful_downloads = 0
    failed_downloads = []
    
    for mp_id, rep_id in mp_id_mapping.items():
        photo_url = f"https://www.representatives.jo/RepresentativeImages/{rep_id}.jpg"
        save_path = images_dir / f"{mp_id}.jpg"
        
        try:
            response = requests.get(photo_url, timeout=10)
            if response.status_code == 200 and len(response.content) > 1000:
                with open(save_path, 'wb') as f:
                    f.write(response.content)
                successful_downloads += 1
                print(f"[OK] Downloaded {mp_id}: {photo_url}")
            else:
                failed_downloads.append(mp_id)
                print(f"[SKIP] Invalid image for {mp_id}")
        except Exception as e:
            failed_downloads.append(mp_id)
            print(f"[ERROR] Failed to download {mp_id}: {e}")
    
    print(f"\n[SUCCESS] Downloaded {successful_downloads} photos")
    if failed_downloads:
        print(f"[FAILED] {len(failed_downloads)} photos: {failed_downloads[:10]}")
    
    return successful_downloads, failed_downloads

def update_mps_json(mps, successful_ids):
    """
    Update mps.json with photoUrl for MPs that have photos
    """
    for mp in mps:
        if mp['id'] in successful_ids:
            mp['photoUrl'] = f"/images/mps/{mp['id']}.jpg"
    
    # Save updated mps.json
    with open('public/data/mps.json', 'w', encoding='utf-8') as f:
        json.dump(mps, f, ensure_ascii=False, indent=2)
    
    print("[UPDATED] mps.json with photo URLs")

def main():
    print("=== MP Photo Download System ===\n")
    
    # Step 1: Load our MPs
    print("Step 1: Loading MPs from database...")
    mps = load_mps()
    print(f"Loaded {len(mps)} MPs\n")
    
    # Step 2: Scrape RepresentativeIDs
    print("Step 2: Scraping RepresentativeIDs from parliament website...")
    id_mapping = scrape_representative_ids()
    
    if not id_mapping:
        print("\n[ERROR] Failed to scrape RepresentativeIDs")
        print("Exiting...")
        return
    
    print("\n")
    
    # Step 3: Match MPs to IDs
    print("Step 3: Matching MPs to RepresentativeIDs...")
    mp_id_mapping = match_mps_to_ids(mps, id_mapping)
    print("\n")
    
    # Step 4: Download photos
    print("Step 4: Downloading photos...")
    successful, failed = download_photos(mp_id_mapping)
    print("\n")
    
    # Step 5: Update mps.json
    print("Step 5: Updating mps.json...")
    successful_ids = [mp_id for mp_id in mp_id_mapping.keys() if mp_id not in failed]
    update_mps_json(mps, successful_ids)
    
    print("\n=== COMPLETE ===")
    print(f"Successfully added photos for {len(successful_ids)}/138 MPs")

if __name__ == '__main__':
    main()
