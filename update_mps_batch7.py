#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Update script for MPs 121-132
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
    
    # MP data with committee memberships
    mp_updates = {
        121: {
            'name': 'ميسون صبحي محمد القوابعة',
            'ordinary_1': ['لجنة الصحة والغذاء', 'لجنة المرأة وشؤون الأسرة'],
            'ordinary_2': []
        },
        122: {
            'name': 'ناصر سالمه عقله نواصره',
            'ordinary_1': ['اللجنة القانونية', 'اللجنة المالية'],
            'ordinary_2': ['اللجنة المالية', 'اللجنة القانونية']
        },
        123: {
            'name': 'نبيل كامل أحمد الشيشاني',
            'ordinary_1': ['لجنة الخدمات العامة والنقل', 'لجنة الريف والبادية'],
            'ordinary_2': ['لجنة السياحة والآثار']
        },
        124: {
            'name': 'نجمة شفيق خايف الهواوشه',
            'ordinary_1': ['لجنة السياحة والآثار', 'لجنة التربية والتعليم'],
            'ordinary_2': ['اللجنة المالية', 'لجنة السياحة والآثار']
        },
        125: {
            'name': 'نسيم عارف إبراهيم العبادي',
            'ordinary_1': ['اللجنة الإدارية', 'لجنة الطاقة والثروة المعدنية'],
            'ordinary_2': ['اللجنة الإدارية', 'لجنة الطاقة والثروة المعدنية']
        },
        126: {
            'name': 'نصار حسن سالم القيسي',
            'ordinary_1': [],
            'ordinary_2': ['لجنة الرد على خطاب العرش']
        },
        127: {
            'name': 'نمر عبدالحميد عبدالله الفقهاء العبادي',
            'ordinary_1': ['اللجنة المالية'],
            'ordinary_2': ['اللجنة المالية', 'لجنة التربية والتعليم']
        },
        128: {
            'name': 'نور حسني أحمد أبو غوش',
            'ordinary_1': ['لجنة التوجيه الوطني والإعلام', 'لجنة الشباب والرياضة والثقافة'],
            'ordinary_2': ['لجنة الشباب والرياضة والثقافة', 'لجنة التوجيه الوطني والإعلام']
        },
        129: {
            'name': 'هالة يوسف محمود الجراح',
            'ordinary_1': ['لجنة المرأة وشؤون الأسرة', 'لجنة التربية والتعليم'],
            'ordinary_2': []
        },
        130: {
            'name': 'هايل فريح جريس عياش',
            'ordinary_1': ['لجنة الاقتصاد والاستثمار', 'لجنة الصحة والغذاء'],
            'ordinary_2': ['لجنة الصحة والغذاء']
        },
        131: {
            'name': 'هدى إبراهيم نصار نفاع',
            'ordinary_1': [],
            'ordinary_2': ['لجنة الرد على خطاب العرش', 'لجنة الاقتصاد والاستثمار', 'لجنة الشؤون الخارجية']
        },
        132: {
            'name': 'هدى حسين محمد عتوم',
            'ordinary_1': ['لجنة العمل والتنمية الاجتماعية والسكان', 'لجنة الزراعة والمياه'],
            'ordinary_2': ['لجنة التربية والتعليم', 'لجنة العمل والتنمية الاجتماعية والسكان']
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
    print(f"\n[SUCCESS] Successfully updated {updated_count} MPs (121-132)")
    print(f"[SAVED] Saved to public/data/mps.json")

if __name__ == '__main__':
    main()
