#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Final manual adjustment: move 3 MPs from Centrist to Mubadara
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
    
    # These MPs should be in Mubadara but are currently in Centrist
    # Based on user's list
    mubadara_names = [
        'رند',  # رند جهاد فؤاد الخزوز
        'عبدالهادي',  # عبدالهادي سليمان ثاني البريزات  
        'عيسى مخائيل'  # عيسى مخائيل سلامة نصار
    ]
    
    moved = []
    
    for mp in mps:
        name = mp['fullName']
        
        # Check if this MP should be in Mubadara
        should_move = False
        if 'رند' in name and 'الخزوز' in name:
            should_move = True
        elif 'عبدالهادي' in name and 'البريزات' in name:
            should_move = True
        elif 'عيسى' in name and 'مخائيل' in name:
            should_move = True
        
        if should_move and mp.get('memberships'):
            for membership in mp['memberships']:
                if membership['session'] == 'ordinary_2':
                    current = membership.get('bloc', '')
                    if current != "كتلة حزب مبادرة النيابية":
                        membership['bloc'] = "كتلة حزب مبادرة النيابية"
                        moved.append(f"{mp['id']}: {name}")
                        print(f"Moved: {name}")
    
    save_mps(mps)
    print(f"\nMoved {len(moved)} MPs to Mubadara")
    
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
        if actual == exp:
            print(f"[OK] {bloc[:45]}: {actual}/{exp}")
        else:
            print(f"[ERROR] {bloc[:45]}: {actual}/{exp}")
            all_correct = False
    
    if all_correct:
        print("\n*** SUCCESS! ALL BLOCS ARE NOW CORRECT! ***")
    else:
        print(f"\nStill need to fix {abs(29-26)} more MPs")

if __name__ == '__main__':
    main()
