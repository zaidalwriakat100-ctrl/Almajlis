#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Move the 3 specific MPs from Centrist to Mubadara
"""

import json

def load_mps():
    with open('public/data/mps.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_mps(mps):
    with open('public/data/mps.json', 'w', encoding='utf-8') as f:
        json.dump(mps, f, ensure_ascii=False, indent=2)

def main():
    mps = load_mps()
    
    # These 3 MPs are currently in Centrist but should be in Mubadara
    names_to_move = [
        'نسيم عارف',  # نسيم عارف ابراهيم العبادي
        'حمود إبراهيم أحمد الزواهرة',  # حمود إبراهيم أحمد الزواهرة  
        'خميس حسين خليل'  # خميس حسين خليل عطيه
    ]
    
    moved = []
    
    for mp in mps:
        name = mp['fullName']
        
        # Check if this MP should be moved
        should_move = False
        if 'نسيم' in name and 'عارف' in name:
            should_move = True
        elif 'حمود' in name and 'الزواهر' in name:
            should_move = True
        elif 'خميس' in name and 'عطي' in name:
            should_move = True
        
        if should_move and mp.get('memberships'):
            for membership in mp['memberships']:
                if membership['session'] == 'ordinary_2':
                    current = membership.get('bloc', '')
                    membership['bloc'] = "كتلة حزب مبادرة النيابية"
                    moved.append(f"{mp['id']}: {name}")
                    print(f"Moved: {mp['id']} - {name}")
    
    save_mps(mps)
    print(f"\nMoved {len(moved)} MPs from Centrist to Mubadara")
    
    # Verify
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
    
    print("\n=== FINAL VERIFICATION ===")
    all_correct = True
    for bloc, exp in expected.items():
        actual = counts.get(bloc, 0)
        status = "[OK]" if actual == exp else "[ERROR]"
        print(f"{status} {bloc[:45]}: {actual}/{exp}")
        if actual != exp:
            all_correct = False
    
    if all_correct:
        print("\n*** PERFECT! ALL 138 MPs IN CORRECT BLOCS! ***")
    else:
        print("\nSome issues remain")

if __name__ == '__main__':
    main()
