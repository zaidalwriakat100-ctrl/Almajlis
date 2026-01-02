import json
import re
import os
import sys
from datetime import datetime

# ================================
# ✅ BACKEND ENTRY POINT (IMPORTANT)
# ================================
def auto_process_session(text: str):
    """
    Entry point for FastAPI backend.
    Currently returns the text as-is.
    Later this can include cleaning, splitting, or AI logic.
    """
    return {
        "raw_text": text,
        "length": len(text),
        "status": "ok"
    }


# ================================
# Try to import Gemini SDK
# ================================
try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError as e:
    print(f"Import Error: {e}")
    HAS_GENAI = False


# ================================
# Configuration
# ================================
MPS_FILE = 'public/data/mps.json'
SESSIONS_FILE = 'public/data/sessions.json'
API_KEY = os.getenv("GEMINI_API_KEY") or "PUT_YOUR_API_KEY_HERE"


# ================================
# Utilities
# ================================
def load_mps():
    with open(MPS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def normalize_text(text):
    if not text:
        return ""
    text = text.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    text = text.replace("ة", "ه").replace("ى", "ي")
    return re.sub(r'[^\w\s]', '', text).strip()


# ================================
# AI Processing
# ================================
def process_transcript_ai(text, file_name):
    if not HAS_GENAI or not API_KEY:
        return {
            "sessionOverview": {
                "summaryBullets": ["لم يتم تفعيل الذكاء الاصطناعي"],
                "mainTopics": ["غير محدد"],
                "keyLawsOrFiles": []
            },
            "segments": [
                {
                    "speakerName": "غير محدد",
                    "speakerRole": "غير معروف",
                    "textExcerpt": text[:200],
                    "fullText": text,
                    "topics": [],
                    "stanceTowardGovernment": "حيادي",
                    "summaryBullets": ["نص تجريبي"]
                }
            ]
        }

    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel("gemini-flash-latest")

    prompt = f"""
    حلل الجلسة البرلمانية التالية باللغة العربية فقط.
    اسم الملف: {file_name}

    المطلوب:
    - تحديد المواضيع الرئيسية
    - تحديد المتحدثين
    - تلخيص كل متحدث

    النص:
    {text[:30000]}
    """

    response = model.generate_content(prompt)
    clean = response.text.replace("```json", "").replace("```", "")

    try:
        return json.loads(clean)
    except:
        return None


# ================================
# PDF Helper
# ================================
def extract_text_from_pdf(pdf_path):
    try:
        from pypdf import PdfReader
        reader = PdfReader(pdf_path)
        return "\n".join([p.extract_text() or "" for p in reader.pages])
    except Exception as e:
        print(f"PDF Error: {e}")
        return None


# ================================
# CLI / Standalone Mode
# ================================
def main():
    print("--- Parliament Transcript Processor ---")

    transcript_dir = "transcripts"
    if not os.path.exists(transcript_dir):
        os.makedirs(transcript_dir)
        print("ضع ملفات الجلسات داخل مجلد transcripts")
        return

    import glob
    files = glob.glob(f"{transcript_dir}/*.txt") + glob.glob(f"{transcript_dir}/*.pdf")

    if not files:
        print("لا توجد ملفات جلسات")
        return

    try:
        with open(SESSIONS_FILE, 'r', encoding='utf-8') as f:
            sessions_data = json.load(f)
    except:
        sessions_data = []

    mps = load_mps()

    for path in files:
        name = os.path.basename(path)
        print(f"Processing {name}")

        if path.endswith(".pdf"):
            text = extract_text_from_pdf(path)
        else:
            with open(path, 'r', encoding='utf-8') as f:
                text = f.read()

        ai_data = process_transcript_ai(text, name)
        if not ai_data:
            continue

        session = {
            "id": f"sess_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "title": f"محضر جلسة: {name}",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "analysisStatus": "ready",
            "sessionOverview": ai_data.get("sessionOverview", {}),
            "segments": ai_data.get("segments", [])
        }

        sessions_data.append(session)

        with open(SESSIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(sessions_data, f, ensure_ascii=False, indent=2)

    print("تم الانتهاء بنجاح")


if __name__ == "__main__":
    main()
