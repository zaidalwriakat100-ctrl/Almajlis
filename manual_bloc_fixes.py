#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Manual fix for the remaining MPs with name variations
"""

import json

def load_mps():
    with open('public/data/mps.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_mps(mps):
    with open('public/data/mps.json', 'w', encoding='utf-8') as f:
        json.dump(mps, f, ensure_ascii=False, indent=2)

# Manual mapping for MPs that didn't match
# Based on likely variations in spelling
MANUAL_FIXES = {
    # Format: mp_id: bloc_name
    # We'll find these by partial name matching
}

def partial_match(mp_name, search_terms):
    """Check if any search term is in MP name"""
    for term in search_terms:
        if term in mp_name:
            return True
    return False

def main():
    mps = load_mps()
    
    # Find and fix remaining MPs
    fixes = []
    
    for mp in mps:
        name = mp['fullName']
        mp_id = mp['id']
        
        # Find which bloc this MP should be in based on partial names
        target_bloc = None
        
        # Check for specific hard-to-match names
        if partial_match(name, ['حياه', 'حياة']):
            target_bloc = "كتلة جبهة العمل الإسلامي"
        elif 'ديمه' in name or 'ديما' in name:
            target_bloc = "كتلة جبهة العمل الإسلامي"
        elif 'هيثم' in name and 'الزيادين' in name:
            target_bloc = "كتلة حزب الميثاق الوطني"
        elif 'إسماعيل' in name and 'المشاقبه' in name:
            target_bloc = "النواب المستقلون"
        elif 'محمود' in name and 'النعيمات' in name:
            target_bloc = "النواب المستقلون"
        elif 'عبدالرؤوف' in name and 'الربيحات' in name:
            target_bloc = "النواب المستقلون"
        
        if target_bloc and mp.get('memberships'):
            for membership in mp['memberships']:
                if membership['session'] == 'ordinary_2':
                    current = membership.get('bloc', '')
                    if current != target_bloc:
                        membership['bloc'] = target_bloc
                        fixes.append(f"{mp_id}: {name[:30]}... -> {target_bloc[:30]}...")
    
    if fixes:
        save_mps(mps)
        print(f"Applied {len(fixes)} manual fixes:")
        for fix in fixes:
            print(f"  {fix}")
    else:
        print("No additional fixes needed")
    
    # Final verification
    from collections import Counter
    blocs = []
    for mp in mps:
        if mp.get('memberships'):
            for mem in mp['memberships']:
                if mem['session'] == 'ordinary_2':
                    blocs.append(mem.get('bloc', 'Unknown'))
                    break
    
    counts = Counter(blocs)
    
    expected = {
        "كتلة اتحاد الأحزاب الوسطية والوطني الإسلامي": 26,
        "كتلة حزب مبادرة النيابية": 23,
        "كتلة جبهة العمل الإسلامي": 31,
        "كتلة حزب عزم": 20,
        "كتلة حزب الميثاق الوطني": 35,
        "النواب المستقلون": 3
    }
    
    print("\n=== Final Status ===")
    all_correct = True
    for bloc, exp in expected.items():
        actual = counts.get(bloc, 0)
        status = "OK" if actual == exp else "WRONG"
        print(f"[{status}] {bloc[:40]}: {actual}/{exp}")
        if actual != exp:
            all_correct = False
    
    print(f"\nTotal: {sum(counts.values())}/138")
    
    if all_correct:
        print("\n[PERFECT] All blocs are now correct!")

if __name__ == '__main__':
    main()
