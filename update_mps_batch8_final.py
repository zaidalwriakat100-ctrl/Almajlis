#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Update script for MPs 133-138 (FINAL BATCH)
Updates committee memberships for both ordinary sessions
"""

import json

def load_mps():
    """Load MPs from JSON file"""
    with open('public/data/mps.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_mps(mps):
    """Save MPs to JSON file"""
    with open('public/data/mps.json', 'w', encoding='utf-8') as f:
        json.dump(mps, f, ensure_ascii=False, indent=2)

def update_mp_committees(mp, ordinary_1_committees, ordinary_2_committees):
    """Update MP's committee memberships for both sessions"""
    if 'memberships' not in mp:
        mp['memberships'] = []
    
    # Update ordinary_1
    session_1 = next((s for s in mp['memberships'] if s['session'] == 'ordinary_1'), None)
    if session_1:
        if ordinary_1_committees:
            session_1['committees'] = ordinary_1_committees
        else:
            # Remove committees key if no committees
            session_1.pop('committees', None)
    
    # Update ordinary_2
    session_2 = next((s for s in mp['memberships'] if s['session'] == 'ordinary_2'), None)
    if session_2:
        if ordinary_2_committees:
            session_2['committees'] = ordinary_2_committees
        else:
            # Remove committees key if no committees
            session_2.pop('committees', None)

def main():
    # Load MPs
    mps = load_mps()
    
    # MP data with committee memberships (FINAL 6 MPs)
    mp_updates = {
        133: {
            'name': 'هيثم جريس عودة الصيادين',
            'ordinary_1': ['لجنة الطاقة والثروة المعدنية'],
            'ordinary_2': ['لجنة المرأة وشؤون الأسرة', 'لجنة الشؤون الخارجية']
        },
        134: {
            'name': 'وسام محمد عبدالغني الربيحات',
            'ordinary_1': ['اللجنة الإدارية', 'لجنة العمل والتنمية الاجتماعية والسكان'],
            'ordinary_2': ['لجنة الرد على خطاب العرش', 'اللجنة الإدارية', 'لجنة العمل والتنمية الاجتماعية والسكان']
        },
        135: {
            'name': 'وصفي هلال عبدالله حداد',
            'ordinary_1': ['لجنة الشؤون الخارجية', 'لجنة السياحة والآثار'],
            'ordinary_2': ['لجنة السياحة والآثار']
        },
        136: {
            'name': 'وليد حامد صالح المصري',
            'ordinary_1': ['لجنة الاقتصاد والاستثمار', 'لجنة الخدمات العامة والنقل'],
            'ordinary_2': ['لجنة الاقتصاد والاستثمار', 'لجنة فلسطين']
        },
        137: {
            'name': 'ينال عبدالسلام نورالدين الفريحات',
            'ordinary_1': ['لجنة فلسطين'],
            'ordinary_2': ['لجنة فلسطين']
        },
        138: {
            'name': 'يوسف محمد هارون الرواضيه',
            'ordinary_1': ['لجنة السياحة والآثار'],
            'ordinary_2': ['لجنة العمل والتنمية الاجتماعية والسكان', 'لجنة السياحة والآثار']
        }
    }
    
    # Update each MP
    updated_count = 0
    for mp_id, data in mp_updates.items():
        mp = next((m for m in mps if m['id'] == f'mp_{mp_id}'), None)
        if mp:
            update_mp_committees(mp, data['ordinary_1'], data['ordinary_2'])
            updated_count += 1
            print(f"[OK] Updated MP {mp_id}: {data['name']}")
        else:
            print(f"[ERROR] MP {mp_id} not found: {data['name']}")
    
    # Save updated data
    save_mps(mps)
    print(f"\n[SUCCESS] Successfully updated {updated_count} MPs (133-138)")
    print(f"[COMPLETE] ALL 138 MPs UPDATED!")
    print(f"[SAVED] Saved to public/data/mps.json")

if __name__ == '__main__':
    main()
