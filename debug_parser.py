import re

def parse_line(text):
    print(f"Original Text: {text}")
    items = re.split(r'/(?=\s*الدورة)', text)
    print(f"Split Items: {items}")
    
    results = []
    
    for item in items:
        item = item.strip()
        if not item: continue
        
        parts = item.split(' - ')
        print(f"Parts: {parts}")
        
        if len(parts) >= 2:
            if len(parts) > 2:
                 value = " - ".join(parts[1:]).strip()
            else:
                value = parts[1].strip()
            
            print(f"Value: {value}")

            if "/" in value:
                comm_name = value.split("/")[-1].strip()
            else:
                comm_name = value
            
            print(f"Extracted Committee: {comm_name}")
            results.append(comm_name)
    return results

line_8 = "الدورة العادية الأولى - اللجان الدائمة / اللجنة القانونية/الدورة العادية الأولى - اللجان الدائمة / اللجنة الإدارية"
print("--- Test 1 ---")
parse_line(line_8)

line_31 = "الدورة العادية الأولى - اللجان الدائمة / لجنة التربية والتعليم/الدورة العادية الثانية - اللجان الدائمة / لجنة التربية والتعليم/الدورة العادية الثانية - اللجان الدائمة / اللجنة الإدارية"
print("\n--- Test 2 ---")
parse_line(line_31)
