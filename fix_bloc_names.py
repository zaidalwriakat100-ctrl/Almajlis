#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix bloc names in mps.json to match blocs.json standard names
This will ensure accurate bloc member counts
"""

import json

# Correct bloc names for ordinary_2 (from blocs.json)
CORRECT_BLOC_NAMES = {
    "ordinary_2": {
        "كتلة جبهة العمل الإسلامي": 31,
        "كتلة حزب الميثاق الوطني": 35,
        "كتلة اتحاد الأحزاب الوسطية والوطني الإسلامي": 26,
        "كتلة حزب مبادرة النيابية": 23,
        "كتلة حزب عزم": 20,
        "النواب المستقلون": 3
    }
}

# Mapping variations to correct names
BLOC_NAME_MAPPING = {
    # جبهة العمل الإسلامي variations
    "كتلة حزب جبهة العمل الإسلامي": "كتلة جبهة العمل الإسلامي",
    "كتلة جبهة العمل الاسلامي": "كتلة جبهة العمل الإسلامي",
    "جبهة العمل الإسلامي": "كتلة جبهة العمل الإسلامي",
    
    # الميثاق الوطني - already correct
    "كتلة حزب الميثاق الوطني": "كتلة حزب الميثاق الوطني",
    
    # الوسطية والوطني variations
    "كتلة اتحاد الأحزاب الوسطية": "كتلة اتحاد الأحزاب الوسطية والوطني الإسلامي",
    "كتلة Centrist": "كتلة اتحاد الأحزاب الوسطية والوطني الإسلامي",
    
    # مبادرة - already correct
    "كتلة حزب مبادرة النيابية": "كتلة حزب مبادرة النيابية",
    "كتلة مبادرة": "كتلة حزب مبادرة النيابية",
    
    # عزم - already correct
    "كتلة حزب عزم": "كتلة حزب عزم",
    
    # مستقلون - already correct
    "النواب المستقلون": "النواب المستقلون"
}

def load_mps():
    with open('public/data/mps.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_mps(mps):
    with open('public/data/mps.json', 'w', encoding='utf-8') as f:
        json.dump(mps, f, ensure_ascii=False, indent=2)

def normalize_bloc_name(bloc_name):
    """Normalize bloc name to standard format"""
    if not bloc_name:
        return bloc_name
    return BLOC_NAME_MAPPING.get(bloc_name, bloc_name)

def main():
    print("=== Fixing Bloc Names in mps.json ===\n")
    
    mps = load_mps()
    fixed_count = 0
    
    for mp in mps:
        if not mp.get('memberships'):
            continue
        
        for membership in mp['memberships']:
            if membership['session'] == 'ordinary_2':
                old_bloc = membership.get('bloc', '')
                new_bloc = normalize_bloc_name(old_bloc)
                
                if old_bloc != new_bloc:
                    membership['bloc'] = new_bloc
                    fixed_count += 1
                    print(f"[FIXED] {mp['id']}: '{old_bloc}' -> '{new_bloc}'")
    
    # Save changes
    save_mps(mps)
    
    # Verify counts
    print(f"\n=== Verification ===")
    from collections import Counter
    blocs = [
        m['memberships'][0]['bloc'] 
        for m in mps 
        if m.get('memberships') 
        and any(mem['session'] == 'ordinary_2' for mem in m['memberships'])
    ]
    
    # Get ordinary_2 blocs
    ordinary_2_blocs = []
    for m in mps:
        if m.get('memberships'):
            for mem in m['memberships']:
                if mem['session'] == 'ordinary_2' and mem.get('bloc'):
                    ordinary_2_blocs.append(mem['bloc'])
                    break
    
    counts = Counter(ordinary_2_blocs)
    
    print("\nActual counts in mps.json (ordinary_2):")
    for bloc, count in sorted(counts.items()):
        expected = CORRECT_BLOC_NAMES['ordinary_2'].get(bloc, '?')
        status = "[OK]" if count == expected else "[MISMATCH]"
        print(f"{status} {bloc}: {count} (expected: {expected})")
    
    print(f"\nTotal fixed: {fixed_count}")
    print(f"Total MPs: {len(ordinary_2_blocs)}/138")

if __name__ == '__main__':
    main()
