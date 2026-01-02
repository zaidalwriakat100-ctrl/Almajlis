#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comprehensive fix for bloc names in mps.json
Standardizes all variations to match blocs.json official names
"""

import json
import re

def load_mps():
    with open('public/data/mps.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_mps(mps):
    with open('public/data/mps.json', 'w', encoding='utf-8') as f:
        json.dump(mps, f, ensure_ascii=False, indent=2)

# Correct standardized bloc names from blocs.json
STANDARD_BLOCS = {
    "كتلة جبهة العمل الإسلامي": 31,
    "كتلة حزب الميثاق الوطني": 35,
    "كتلة اتحاد الأحزاب الوسطية والوطني الإسلامي": 26,
    "كتلة حزب مبادرة النيابية": 23,
    "كتلة حزب عزم": 20,
    "النواب المستقلون": 3
}

def normalize_bloc_name(name):
    """
    Normalize bloc name to standard format using fuzzy matching
    """
    if not name or not isinstance(name, str):
        return name
    
    name = name.strip()
    
    # Direct matches (already correct)
    if name in STANDARD_BLOCS:
        return name
    
    # جبهة العمل الإسلامي variations
    if 'جبهة العمل' in name or 'الإسلامي' in name:
        return "كتلة جبهة العمل الإسلامي"
    
    # الميثاق الوطني variations
    if 'الميثاق' in name:
        return "كتلة حزب الميثاق الوطني"
    
    # الوسطية variations (may include "والوطني الإسلامي" or not)
    if 'الوسطية' in name or 'وسطية' in name:
        return "كتلة اتحاد الأحزاب الوسطية والوطني الإسلامي"
    
    # مبادرة variations
    if 'مبادرة' in name:
        return "كتلة حزب مبادرة النيابية"
    
    # عزم variations
    if 'عزم' in name:
        return "كتلة حزب عزم"
    
    # مستقل variations
    if 'مستقل' in name:
        return "النواب المستقلون"
    
    # إرادة (might be grouped with Centrist now)
    if 'إرادة' in name or 'اراده' in name:
        # Check if it should be Centrist coalition
        return "كتلة اتحاد الأحزاب الوسطية والوطني الإسلامي"
    
    # تقدم (might be independent or other)
    if 'تقدم' in name:
        return "النواب المستقلون"
    
    # If nothing matches, return as is
    return name

def main():
    print("=== Comprehensive Bloc Name Fix ===\n")
    
    mps = load_mps()
    
    # Track changes
    changes = []
    bloc_counts_before = {}
    bloc_counts_after = {}
    
    # First pass: collect current state
    for mp in mps:
        if not mp.get('memberships'):
            continue
        
        for membership in mp['memberships']:
            if membership['session'] == 'ordinary_2':
                bloc = membership.get('bloc', '')
                bloc_counts_before[bloc] = bloc_counts_before.get(bloc, 0) + 1
    
    # Second pass: fix names
    for mp in mps:
        if not mp.get('memberships'):
            continue
        
        for membership in mp['memberships']:
            if membership['session'] == 'ordinary_2':
                old_name = membership.get('bloc', '')
                new_name = normalize_bloc_name(old_name)
                
                if old_name != new_name:
                    membership['bloc'] = new_name
                    changes.append({
                        'mp_id': mp['id'],
                        'mp_name': mp['fullName'],
                        'old': old_name,
                        'new': new_name
                    })
    
    # Third pass: count after changes
    for mp in mps:
        if not mp.get('memberships'):
            continue
        
        for membership in mp['memberships']:
            if membership['session'] == 'ordinary_2':
                bloc = membership.get('bloc', '')
                bloc_counts_after[bloc] = bloc_counts_after.get(bloc, 0) + 1
    
    # Save changes
    save_mps(mps)
    
    # Report
    print(f"Total changes made: {len(changes)}\n")
    
    if changes:
        print("Sample changes (first 10):")
        for change in changes[:10]:
            print(f"  {change['mp_id']}: {change['old'][:30]}... -> {change['new'][:30]}...")
    
    print("\n=== Final Bloc Counts (ordinary_2) ===\n")
    for bloc_name, expected_count in STANDARD_BLOCS.items():
        actual_count = bloc_counts_after.get(bloc_name, 0)
        status = "OK" if actual_count == expected_count else "MISMATCH"
        print(f"[{status}] {bloc_name}")
        print(f"        Expected: {expected_count}, Actual: {actual_count}")
    
    # Check for unexpected blocs
    unexpected = set(bloc_counts_after.keys()) - set(STANDARD_BLOCS.keys())
    if unexpected:
        print("\nUnexpected bloc names found:")
        for bloc in unexpected:
            print(f"  - {bloc}: {bloc_counts_after[bloc]} members")
    
    total = sum(bloc_counts_after.values())
    print(f"\nTotal MPs in ordinary_2: {total}/138")
    
    if total == 138 and not unexpected:
        print("\n[SUCCESS] All bloc names fixed successfully!")
    else:
        print(f"\n[WARNING] Still have issues - total={total}, unexpected blocs={len(unexpected)}")

if __name__ == '__main__':
    main()
