#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Process MP photos from Google Doc HTML and match with MPs
Reads the HTML file to extract MP names and their photo file associations
"""

import json
import shutil
from pathlib import Path
from bs4 import BeautifulSoup
import re

def load_mps():
    with open('public/data/mps.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_mps(mps):
    with open('public/data/mps.json', 'w', encoding='utf-8') as f:
        json.dump(mps, f, ensure_ascii=False, indent=2)

def parse_html_for_mp_photos():
    """
    Parse the HTML file to extract MP names and their associated image files
    Returns a list of tuples: [(mp_name, image_filename), ...]
    """
    html_path = Path('temp_mp_photos/Copy of معلومات النواب_ المجلس العشرون/Copyof_.html')
    
    with open(html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    # Find all images
    images = soup.find_all('img')
    
    # Extract MP data - assuming document has pattern of name followed by image
    mp_photo_pairs = []
    
    # Strategy: look for text containing "سعادة" (honorific) or Arabic names
    # and associate with nearby images
    
    # Get all text blocks
    text_blocks = soup.find_all(['p', 'div', 'span'])
    
    for text_block in text_blocks:
        text = text_block.get_text(strip=True)
        
        # Check if this looks like an MP name (contains Arabic and is substantial)
        if len(text) > 10 and any('\u0600' <= c <= '\u06FF' for c in text):
            # Find nearest image after this text
            next_img = text_block.find_next('img')
            if next_img and next_img.get('src'):
                img_src = next_img['src']
                # Extract filename from src
                img_filename = Path(img_src).name
                mp_photo_pairs.append((text, img_filename))
    
    return mp_photo_pairs

def normalize_name(name):
    """Normalize MP name for matching"""
    name = ' '.join(name.split())
    name = name.replace('سعادة السيد', '').replace('سعادة النائب', '').replace('سعادة', '').strip()
    # Remove extra text like phone numbers, emails,  etc
    name = re.sub(r'\d+', '', name)  # Remove numbers
    name = re.sub(r'[A-Za-z@.]', '', name)  # Remove English letters and email chars
    name = ' '.join(name.split())
    return name

def find_mp_by_name(mps, target_name):
    """Find MP by name with fuzzy matching"""
    target_normalized = normalize_name(target_name)
    
    for mp in mps:
        mp_normalized = normalize_name(mp['fullName'])
        
        # Check if names match (all words in one are in the other)
        target_words = set(target_normalized.split())
        mp_words = set(mp_normalized.split())
        
        # Need at least 2 matching words for confidence
        matching_words = target_words & mp_words
        if len(matching_words) >= 2:
            return mp
    
    return None

def main():
    print("=== Processing MP Photos from Google Doc ===\n")
    
    # Parse HTML to get MP-photo associations
    print("Step 1: Parsing HTML file...")
    mp_photo_pairs = parse_html_for_mp_photos()
    print(f"Found {len(mp_photo_pairs)} MP-photo pairs\n")
    
    if not mp_photo_pairs:
        print("[ERROR] No MP-photo pairs found in HTML!")
        return
    
    # Show sample
    print("Sample pairs:")
    for name, img in mp_photo_pairs[:5]:
        print(f"  {name[:40]}... -> {img}")
    print()
    
    # Load MPs
    mps = load_mps()
    
    # Create output directory
    output_dir = Path('public/images/mps')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Source directory
    source_dir = Path('temp_mp_photos/Copy of معلومات النواب_ المجلس العشرون/images')
    
    # Match and copy photos
    print("\nStep 2: Matching and copying photos...\n")
    matched = 0
    not_matched = []
    
    for doc_name, img_filename in mp_photo_pairs:
        mp = find_mp_by_name(mps, doc_name)
        
        if mp:
            # Copy image to output directory with mp_id name
            source_path = source_dir / img_filename
            if source_path.exists():
                dest_path = output_dir / f"{mp['id']}.jpg"
                shutil.copy2(source_path, dest_path)
                
                # Update MP record
                mp['photoUrl'] = f"/images/mps/{mp['id']}.jpg"
                matched += 1
                print(f"[OK] {mp['id']}: {mp['fullName'][:30]}...")
            else:
                print(f"[WARN] Image file not found: {img_filename}")
        else:
            not_matched.append(doc_name[:40])
            print(f"[SKIP] No match for: {doc_name[:40]}...")
    
    # Save updated mps.json
    save_mps(mps)
    
    print(f"\n=== RESULTS ===")
    print(f"Matched and copied: {matched}/138 photos")
    print(f"Not matched: {len(not_matched)}")
    
    if not_matched:
        print(f"\nNot matched (first 10):")
        for name in not_matched[:10]:
            print(f"  - {name}")
    
    if matched >= 100:
        print("\n[SUCCESS] Most MP photos processed!")
    elif matched > 50:
        print("\n[PARTIAL] Some photos processed, may need manual review")
    else:
        print("\n[FAILED] Too few matches, check HTML parsing logic")

if __name__ == '__main__':
    main()
