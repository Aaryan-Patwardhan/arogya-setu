"""
ArogyaSetu - Medical Triage & Clinical Safety Engine
SPDX-FileCopyrightText: 2026 Aaryan Patwardhan
"""

import json
import re
from typing import Dict, Any
from config import GEMINI_API_KEY

# Rule-Based Emergency Keywords in English, Marathi, and Hindi
EMERGENCY_REGEX_PATTERNS = [
    # English
    r"\b(chest\s+pain|heart\s+attack|cardiac|cardiac\s+arrest)\b",
    r"\b(can'?t\s+breathe|difficulty\s+breathing|breathless(ness)?|severe\s+asthma|suffocat(ing|ion))\b",
    r"\b(severe\s+bleeding|heavy\s+blood|hemorrhage|arterial\s+bleed)\b",
    r"\b(unconscious|passed\s+out|unresponsive|collapsed|fainted)\b",
    r"\b(stroke|paralysis|facial\s+droop|slurred\s+speech|numbness\s+one\s+side)\b",
    r"\b(seizure|convulsion|epilep(tic|sy)|fits)\b",
    r"\b(poison(ing)?|venom|snake\s*bite|consumed\s+chemical|overdose)\b",
    r"\b(severe\s+burn|electric\s+shock|head\s+trauma|skull\s+fracture)\b",
    
    # Marathi (मराठी)
    r"(छातीत\s*दुख(णे|त|ते)|हार्ट\s*अ‍ॅटॅक|हृदयविकार)",
    r"(श्वास\s*(घेण्यास\s*त्रास|गुदमरणे|थांबणे)|दम\s*लाग(णे|तो))",
    r"(रक्तस्त्राव|रक्त\s*(वाहणे|पडणे|थांबत\s*नाही)|जास्त\s*रक्त)",
    r"(बेशुद्ध|शुद्ध\s*हरपली|चक्कर\s*येऊन\s*पड(णे|ला|ली)|हालचाल\s*नाही)",
    r"(पक्षाघात|लकवा|झटके|आकडी|फिट\s*येणे)",
    r"(विषबाधा|विष\s*घेतले|सर्पदंश|साप\s*चावला)",
    r"(डोक्याला\s*मार|मोठा\s*अपघात|गंभीर\s*जखम)",

    # Hindi (हिंदी)
    r"(सीने\s*में\s*दर्द|हार्ट\s*अटैक|छाती\s*में\s*दर्द|दिल\s*का\s*दौरा)",
    r"(सांस\s*(लेने\s*में\s*तकलीफ|फूलना|घुटने\s*लगी)|दम\s*घुटना)",
    r"(खून\s*(बहना|निकलना|रुक\s*नहीं\s*रहा)|अत्यधिक\s*रक्तस्राव)",
    r"(बेहोश|बेहोशी|मूर्छित|गिर\s*पड़ा|होश\s*उड़ना)",
    r"(दौरा|मिर्गी|झटके|लकवा|पक्षाघात)",
    r"(जहर|विषाक्तता|सांप\s*ने\s*काटा|सर्पदंश)",
    r"(सिर\s*में\s*गंभीर\s*चोट|बड़ा\s*हादसा|भीषण\s*दुर्घटना)"
]

DISCLAIMERS = {
    "en": "⚠️ Disclaimer: ArogyaSetu is an AI-powered triage and locator guide, not a licensed medical professional. In case of life-threatening emergencies, call 108 or 112 immediately or visit the nearest emergency facility.",
    "hi": "⚠️ अस्वीकरण: आरोग्यसेतु एक AI-आधारित ट्राइएज और अस्पताल लोकेटर है, यह कोई प्रमाणित डॉक्टर नहीं है। आपातकालीन स्थिति में तुरंत 108 या 112 पर कॉल करें या नजदीकी आपातकालीन अस्पताल जाएं।",
    "mr": "⚠️ अस्वीकरण: आरोग्यसेतु हे एआय-आधारित ट्रायज व रुग्णालय शोधक सहाय्यक आहे, हा कोणताही प्रमाणित वैद्यकीय सल्लागार किंवा डॉक्टर नाही. आणीबाणीच्या प्रसंगी ताबडतोब १०८ किंवा ११२ वर कॉल करा किंवा जवळच्या रुग्णालयात जा."
}

def detect_emergency_keywords(text: str) -> bool:
    """Run regex guardrail on user query."""
    text_clean = text.lower()
    for pattern in EMERGENCY_REGEX_PATTERNS:
        if re.search(pattern, text_clean, flags=re.IGNORECASE):
            return True
    return False

def get_offline_fallback(user_query: str, language: str, is_emergency: bool) -> Dict[str, Any]:
    """Fallback triage when Gemini API is unconfigured or unreachable."""
    lang = language.lower() if language in ["en", "hi", "mr"] else "en"
    
    if is_emergency:
        responses = {
            "en": "Potential emergency detected based on critical symptoms. Please seek immediate emergency medical care without delay.",
            "hi": "गंभीर लक्षणों के आधार पर आपातकालीन स्थिति प्रतीत हो रही है। कृपया बिना किसी देरी के तुरंत आपातकालीन चिकित्सा सहायता लें।",
            "mr": "गंभीर लक्षणांच्या आधारे ही वैद्यकीय आणीबाणीची परिस्थिती वाटत आहे. कृपया त्वरित नजीकच्या आपत्कालीन विभागात धाव घ्या किंवा १०८ वर संपर्क करा."
        }
        actions = {
            "en": "Call 108 for an ambulance, keep the patient calm and seated upright, and do not leave them unattended.",
            "hi": "108 पर एम्बुलेंस को कॉल करें, मरीज को शांत और सुरक्षित बैठाएं, तथा अकेले न छोड़ें।",
            "mr": "१०८ रुग्णवाहिकेला कॉल करा, रुग्णाला शांत बसवून ठेवा आणि त्वरित वैद्यकीय मदत मिळवा."
        }
        urgency = "EMERGENCY"
        specialty = "Emergency"
    else:
        responses = {
            "en": "I have noted your reported symptoms. Based on your description, a formal clinical evaluation at a nearby healthcare facility is recommended.",
            "hi": "मैंने आपके लक्षणों को दर्ज कर लिया है। आपके विवरण के आधार पर, नजदीकी स्वास्थ्य केंद्र पर डॉक्टर से परामर्श करने की सलाह दी जाती है।",
            "mr": "आपल्या लक्षणांची नोंद घेतली आहे. आपल्या त्रासासाठी नजीकच्या आरोग्य केंद्रात किंवा डॉक्टरांकडे जाऊन तपासणी करून घेणे योग्य ठरेल."
        }
        actions = {
            "en": "Rest adequately, stay hydrated, monitor temperature and pulse, and consult a doctor if symptoms persist.",
            "hi": "पर्याप्त विश्राम करें, पानी पिएं, और लक्षण बने रहने पर योग्य चिकित्सक से जांच कराएं।",
            "mr": "विश्रांती घ्या, भरपूर पाणी प्या आणि त्रास वाढल्यास ताबडतोब डॉक्टरांशी संपर्क साधा."
        }
        urgency = "CONSULT_TODAY"
        specialty = "General Medicine"

    return {
        "analysis": "Pre-computed safety evaluation (Offline / Standard Guardrail)",
        "urgency": urgency,
        "specialty_needed": specialty,
        "recommended_action": actions[lang],
        "response_text": responses[lang],
        "is_emergency": is_emergency,
        "disclaimer": DISCLAIMERS[lang]
    }

async def process_medical_query(user_query: str, language: str = "en") -> Dict[str, Any]:
    """
    Triage user health query:
    1. Fast Regex Emergency Guardrail
    2. Google Gemini Flash Structured Analysis
    3. Safe Clinical Output Formatting
    """
    lang = language.lower() if language in ["en", "hi", "mr"] else "en"
    
    # Step 1: Rule-Based Guardrail Check
    is_emergency_flag = detect_emergency_keywords(user_query)

    # If no API key configured, use intelligent rule fallback
    if not GEMINI_API_KEY or GEMINI_API_KEY.startswith("your_"):
        fallback = get_offline_fallback(user_query, lang, is_emergency_flag)
        fallback["note"] = "Running on local safety guardrails. Set GEMINI_API_KEY in backend/.env for generative triage."
        return fallback

    # Step 2: Gemini Flash API Integration
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)

        system_instruction = (
            "You are an empathetic, clinical AI triage assistant for ArogyaSetu, a district healthcare guidance platform.\n"
            "Rules:\n"
            "1. NEVER give a definitive medical diagnosis or prescribe specific drug names or dosages.\n"
            "2. Identify the most appropriate department specialty needed from this exact list: "
            "['Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Nephrology', 'Obstetrics', 'General Medicine'].\n"
            "3. Assess urgency as one of: ['EMERGENCY', 'CONSULT_TODAY', 'HOME_CARE'].\n"
            "4. Provide practical, non-pharmaceutical immediate steps for the patient.\n"
            "5. Provide a warm, conversational, reassuring response in the requested language (English if 'en', Hindi if 'hi', Marathi if 'mr').\n"
            "6. Always return strict, valid JSON with keys: analysis, urgency, specialty_needed, recommended_action, response_text."
        )

        prompt = (
            f"User Health Query: '{user_query}'\n"
            f"Requested Language: '{lang}'\n"
            f"Guardrail Emergency Flag: {is_emergency_flag}\n"
            "Analyze and return strict JSON format."
        )

        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=system_instruction,
            generation_config={"response_mime_type": "application/json"}
        )

        response = await model.generate_content_async(prompt)
        result = json.loads(response.text)

        # Enforce guardrail safety: if regex detected emergency, lock urgency to EMERGENCY
        if is_emergency_flag:
            result["urgency"] = "EMERGENCY"
            result["specialty_needed"] = result.get("specialty_needed") or "Emergency"

        result["is_emergency"] = (result.get("urgency") == "EMERGENCY") or is_emergency_flag
        result["disclaimer"] = DISCLAIMERS.get(lang, DISCLAIMERS["en"])
        return result

    except Exception as e:
        # Graceful fallback on API timeout or error
        fallback = get_offline_fallback(user_query, lang, is_emergency_flag)
        fallback["api_error"] = str(e)
        return fallback
