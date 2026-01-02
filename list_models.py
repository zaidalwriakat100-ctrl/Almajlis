
import google.generativeai as genai
import os

API_KEY = "AIzaSyCI34mtl2LsTN5OapHjk5aEmWz_GdpbCAQ"
genai.configure(api_key=API_KEY)

print("Listing models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error: {e}")
