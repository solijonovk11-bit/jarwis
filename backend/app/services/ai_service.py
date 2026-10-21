import os
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

JARVIS_SYSTEM_PROMPT = """Siz JARVIS — futuristik, yuksak intellektual va samimiy shaxsiy sun'iy intellekt yordamchisiz (Iron Man filmidagi kabi).

Asosiy qoidalar:
1. Odatiy holda doimo o'zbek tilida javob bering. Foydalanuvchiga hurmat bilan "Janob" (yoki agar ayol bo'lsa "Xonim") deb murojaat qiling.
2. Javoblaringiz qisqa, aniq, mazmunli va tez o'qiladigan bo'lsin.
3. Texnik va ilmiy savollarga sodda va tushunarli qilib javob bering.
4. Hech qachon amalga oshirilmagan ishni "bajardim" deb yolg'on aytmang.
5. Windows ilovalarini (Notepad, Kalkulyator) yoki veb-sahifalarni ochish bo'yicha so'rov bo'lsa, buni Windows agenti orqali amalga oshirishingiz mumkinligini xushmuomalalik bilan tasdiqlang.
6. Har doim yordamga shay, hushyor va xushmuomala bo'ling.
"""

class AIService:
    def __init__(self):
        self.provider = os.getenv("AI_PROVIDER", "groq").lower()
        self.model = os.getenv("AI_MODEL", "llama-3.3-70b-versatile")
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY", "")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

    def is_configured(self) -> bool:
        """API kaliti sozlanganligini tekshirish."""
        if self.provider == "groq" and self.groq_api_key:
            return True
        if self.provider == "openai" and self.openai_api_key:
            return True
        if self.provider == "openrouter" and self.openrouter_api_key:
            return True
        if self.provider == "gemini" and self.gemini_api_key:
            return True
        if self.provider == "ollama":
            return True
        return False

    async def generate_response(self, user_message: str, history: List[Dict[str, str]]) -> Dict[str, Any]:
        """AI javobini generatsiya qilish."""
        # 1. Agar kalit mavjud bo'lsa, tashqi API orqali chaqiramiz
        if self.is_configured():
            try:
                if self.provider == "groq":
                    return await self._call_openai_compatible(
                        base_url="https://api.groq.com/openai/v1/chat/completions",
                        api_key=self.groq_api_key,
                        model=self.model or "llama-3.3-70b-versatile",
                        user_message=user_message,
                        history=history
                    )
                elif self.provider == "openai":
                    return await self._call_openai_compatible(
                        base_url="https://api.openai.com/v1/chat/completions",
                        api_key=self.openai_api_key,
                        model=self.model or "gpt-4o-mini",
                        user_message=user_message,
                        history=history
                    )
                elif self.provider == "openrouter":
                    return await self._call_openai_compatible(
                        base_url="https://openrouter.ai/api/v1/chat/completions",
                        api_key=self.openrouter_api_key,
                        model=self.model or "meta-llama/llama-3.3-70b-instruct",
                        user_message=user_message,
                        history=history
                    )
                elif self.provider == "gemini":
                    return await self._call_gemini(user_message, history)
                elif self.provider == "ollama":
                    return await self._call_ollama(user_message, history)
            except Exception as e:
                # Agar API xatolik bersa (masalan, internet yo'q yoki limit tugagan)
                return {
                    "reply": f"Janob, tashqi AI provayderi ({self.provider}) bilan bog'lanishda xatolik yuz berdi: {str(e)[:120]}. Lokal himoyalangan rejimga o'tildi.",
                    "provider": self.provider,
                    "model": self.model,
                    "suggested_action": self._detect_action(user_message)
                }

        # 2. Agar API kalit kiritilmagan bo'lsa:
        return self._fallback_local_response(user_message)

    async def _call_openai_compatible(
        self, base_url: str, api_key: str, model: str, user_message: str, history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        messages = [{"role": "system", "content": JARVIS_SYSTEM_PROMPT}]
        # Oxirgi 6 ta xabarni qo'shish
        for msg in history[-6:]:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        messages.append({"role": "user", "content": user_message})

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 600
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(base_url, headers=headers, json=payload)
            if resp.status_code != 200:
                raise Exception(f"HTTP {resp.status_code}: {resp.text[:150]}")
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            action = self._detect_action(user_message)
            return {
                "reply": content,
                "provider": self.provider,
                "model": model,
                "suggested_action": action
            }

    async def _call_gemini(self, user_message: str, history: List[Dict[str, str]]) -> Dict[str, Any]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_api_key}"
        contents = []
        for msg in history[-6:]:
            role = "user" if msg.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg.get("content", "")}]})
        contents.append({"role": "user", "parts": [{"text": f"{JARVIS_SYSTEM_PROMPT}\n\nFoydalanuvchi: {user_message}"}]})

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(url, json={"contents": contents})
            if resp.status_code != 200:
                raise Exception(f"HTTP {resp.status_code}: {resp.text[:150]}")
            data = resp.json()
            reply = data["candidates"][0]["content"]["parts"][0]["text"]
            return {
                "reply": reply,
                "provider": "gemini",
                "model": "gemini-1.5-flash",
                "suggested_action": self._detect_action(user_message)
            }

    async def _call_ollama(self, user_message: str, history: List[Dict[str, str]]) -> Dict[str, Any]:
        url = f"{self.ollama_base_url}/api/chat"
        messages = [{"role": "system", "content": JARVIS_SYSTEM_PROMPT}]
        for msg in history[-6:]:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        messages.append({"role": "user", "content": user_message})

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json={"model": self.model or "llama3", "messages": messages, "stream": False})
            if resp.status_code != 200:
                raise Exception(f"HTTP {resp.status_code}: {resp.text[:150]}")
            data = resp.json()
            return {
                "reply": data["message"]["content"],
                "provider": "ollama",
                "model": self.model or "llama3",
                "suggested_action": self._detect_action(user_message)
            }

    def _detect_action(self, text: str) -> Optional[str]:
        """Matndan tizim buyruqlarini aniqlash."""
        low = text.lower()
        if "notepad" in low or "bloknot" in low or "daftarcha" in low:
            return "notepad"
        if "kalkulyator" in low or "calc" in low or "hisoblagich" in low:
            return "calc"
        if "google" in low or "sayt" in low or "veb" in low or "brauzer" in low:
            return "browser"
        return None

    def _fallback_local_response(self, user_message: str) -> Dict[str, Any]:
        """Tashqi API kaliti bo'lmaganda lokal aqlli javob berish tizimi."""
        low = user_message.lower().strip()
        action = self._detect_action(user_message)

        if "salom" in low or "assalomu alaykum" in low:
            reply = "Assalomu alaykum, Janob! JARVIS tizimi to'liq faol. Sizga qanday yordam bera olaman?"
        elif "hol-ahvol" in low or "qandaysan" in low or "ahvol" in low or "ishlar" in low:
            reply = "Barcha ichki modullarim barqaror ishlamoqda, Janob! Tizim resurslari me'yorda. Buyrug'ingizni kutmoqdaman."
        elif "kim" in low and ("san" in low or "siz" in low):
            reply = "Men JARVIS — shaxsiy intellektual yordamchingizman. Ovozli buyruqlar, imo-ishoralar, 3D chizish va Windows operatsiyalarini bajara olaman."
        elif "soat" in low or "vaqt" in low:
            now = datetime.now().strftime("%H:%M")
            reply = f"Janob, hozir soat aniq {now}."
        elif "notepad" in low or "bloknot" in low:
            reply = "Janob, Bloknot (Notepad) dasturini ochish uchun Windows agentiga buyruq yuborishim mumkin. Ekrandagi tugma orqali tasdiqlang."
        elif "kalkulyator" in low or "calc" in low:
            reply = "Kalkulyatorni ochish buyrug'i tayyorlandi. Tasdiqlashingiz bilan Windows agenti uni ishga tushiradi."
        elif "yordam" in low or "nima qila olasan" in low or "buyruqlar" in low:
            reply = "Janob, men quyidagilarni bajara olaman:\n1. Ovozli yoki yozma muloqot (o'zbek tilida)\n2. Ikkala qo'l yordamida 3D fazoda chizish va obyektlarni boshqarish\n3. Windows ilovalarini (Notepad, Kalkulyator) xavfsiz ishga tushirish\n4. Tizim holatini nazorat qilish."
        elif "api" in low or "kalit" in low or "sozlash" in low:
            reply = "Tizim to'liq global AI modeliga ulanishi uchun `backend/.env` faylida `GROQ_API_KEY` yoki `OPENAI_API_KEY` ni kiriting. Groq API kaliti bepul taqdim etiladi."
        else:
            reply = f"Janob, sizning so'rovingiz qabul qilindi: \"{user_message}\". To'liq sun'iy intellekt xizmatlaridan foydalanish uchun backend/.env faylida Groq yoki OpenAI API kalitini kiriting. Ungacha men barcha lokal va Windows agenti buyruqlarini bajara olaman!"

        return {
            "reply": reply,
            "provider": "jarvis-local",
            "model": "offline-rule-core",
            "suggested_action": action
        }

ai_service = AIService()
