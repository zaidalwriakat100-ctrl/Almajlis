#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix bloc assignments based on party membership
Assign MPs to correct blocs according to their party
"""

import json

def load_mps():
    with open('public/data/mps.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_mps(mps):
    with open('public/data/mps.json', 'w', encoding='utf-8') as f:
        json.dump(mps, f, ensure_ascii=False, indent=2)

# Party to Bloc mapping for ordinary_2
PARTY_TO_BLOC = {
    # جبهة العمل الإسلامي (31)
    "حزب جبهة العمل الإسلامي": "كتلة جبهة العمل الإسلامي",
    
    # الميثاق الوطني (35)
    "حزب الميثاق الوطني": "كتلة حزب الميثاق الوطني",
    
    # الوسطية والوطني الإسلامي (26) - includes إرادة
    "اتحاد الأحزاب الوسطية": "كتلة اتحاد الأحزاب الوسطية والوطني الإسلامي",
    "حزب إرادة": "كتلة اتحاد الأحزاب الوسطية والوطني الإسلامي",
    "الوطني الإسلامي": "كتلة اتحاد الأحزاب الوسطية والوطني الإسلامي",
    
    # مبادرة (23)
    "حزب مبادرة": "كتلة حزب مبادرة النيابية",
    
    # عزم (20)
    "حزب عزم": "كتلة حزب عزم",
    
    # تقدم became independent (3)
    "حزب تقدم": "النواب المستقلون",
    "مستقل": "النواب المستقلون",
}

def get_bloc_from_party(party):
    """Get bloc name based on party"""
    if not party:
        return "النواب المستقلون"
    
    # Check exact match
    if party in PARTY_TO_BLOC:
        return PARTY_TO_BLOC[party]
    
    # Fuzzy matching
    party_lower = party.lower()
    
    if 'جبهة العمل' in party or 'إسلامي' in party:
        return "كتلة جبهة العمل الإسلامي"
    elif 'الميثاق' in party:
        return "كتلة حزب الميثاق الوطني"
    elif 'إرادة' in party or 'اراده' in party:
        return "كتلة اتحاد الأحزاب الوسطية والوطني الإسلامي"
    elif 'وسطية' in party:
        return "كتلة اتحاد الأحزاب الوسطية والوطني الإسلامي"
    elif 'مبادرة' in party or 'مبادره' in party:
        return "كتلة حزب مبادرة النيابية"
    elif 'عزم' in party:
        return "كتلة حزب عزم"
    elif 'تقدم' in party:
        return "النواب المستقلون"
    elif 'مستقل' in party:
        return "النواب المستقلون"
    
    return "النواب المستقلون"

def main():
    print("=== Fixing Bloc Assignments Based on Party ===\n")
    
    mps = load_mps()
    changes = []
    
    for mp in mps:
        party = mp.get('party', '').strip()
        
        if not mp.get('memberships'):
            continue
        
        # Get correct bloc based on party
        correct_bloc = get_bloc_from_party(party)
        
        for membership in mp['memberships']:
            if membership['session'] == 'ordinary_2':
                current_bloc = membership.get('bloc', '')
                
                if current_bloc != correct_bloc:
                    changes.append({
                        'id': mp['id'],
                        'name': mp['fullName'],
                        'party': party,
                        'old_bloc': current_bloc,
                        'new_bloc': correct_bloc
                    })
                    membership['bloc'] = correct_bloc
    
    # Save
    save_mps(mps)
    
    print(f"Total changes: {len(changes)}\n")
    
    if changes:
        print("Sample changes:")
        for change in changes[:15]:
            print(f"{change['id']}: {change['party'][:20]}...")
            print(f"  {change['old_bloc'][:40]} ->")
            print(f"  {change['new_bloc'][:40]}\n")
    
    # Verify counts
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
        "كتلة جبهة العمل الإسلامي": 31,
        "كتلة حزب الميثاق الوطني": 35,
        "كتلة اتحاد الأحزاب الوسطية والوطني الإسلامي": 26,
        "كتلة حزب مبادرة النيابية": 23,
        "كتلة حزب عزم": 20,
        "النواب المستقلون": 3
    }
    
    print("\n=== Final Verification ===\n")
    all_correct = True
    for bloc, exp_count in expected.items():
        actual = counts.get(bloc, 0)
        status = "OK" if actual == exp_count else "MISMATCH"
        if status != "OK":
            all_correct = False
        print(f"[{status}] {bloc[:40]}")
        print(f"        Expected: {exp_count}, Actual: {actual}")
    
    print(f"\nTotal: {sum(counts.values())}/138")
    
    if all_correct and sum(counts.values()) == 138:
        print("\n[SUCCESS] All blocs corrected!")
    else:
        print("\n[WARNING] Still have mismatches")
        print("\nAll blocs found:")
        for bloc, count in counts.items():
            if bloc not in expected:
                print(f"  UNEXPECTED: {bloc}: {count}")

if __name__ == '__main__':
    main()
