# 🤖 JARVIS AI — SHAXSIY INTELLEKTUAL YORDAMCHI (MARK VII)

Iron Man filmidagi mashhur JARVIS tizimidan ilhomlangan, to'liq ishlaydigan zamonaviy shaxsiy sun'iy intellekt yordamchisi.

Tizim quyidagi asosiy imkoniyatlarga ega:
- **Futuristik 3D Golografik Interfeys**: Three.js va React Three Fiber orqali harakatlanuvchi reaktor yadrosi.
- **Veb-kamera va Ikki Qo'l Kuzatuvi**: Google MediaPipe Hand Landmarker orqali 21 ta bo'g'inli skelet tahlili va real vaqtda imo-ishoralarni aniqlash.
- **3D Fazoviy Chizish**: Ko'rsatkich barmoq bilan fazoda nurli chiziqlar, doira, uchburchak va to'rtburchaklar chizish.
- **O'zbek Tilidagi Ovozli Muloqot**: Web Speech API (STT & TTS), ovozli transkripsiya, o'zbekcha nutq sintezi va o'z ovozini qayta yozib olishdan himoya (echo cancellation).
- **Kuchli AI Backend**: FastAPI, SQLite suhbatlar tarixi va modulli AI provayderlari (Groq, OpenAI, Gemini, Ollama).
- **Xavfsiz Windows Agenti**: Mahalliy kompyuterda (127.0.0.1) ruxsat berilgan ilovalarni (Notepad, Kalkulyator, Brauzer) xavfsiz ishga tushirish va tizim telemetriyasini (CPU, RAM, Disk, Batareya) kuzatish.

---

## 📋 TIZIM TALABLARI

Dasturni ishga tushirish uchun kompyuteringizda quyidagilar o'rnatilgan bo'lishi kerak:
1. **Operatsion tizim**: Windows 10 yoki Windows 11 (64-bit)
2. **Node.js**: v18.0 yoki undan yuqori (tavsiya etiladi: v20+ yoki v24+)
3. **Python**: v3.11 yoki v3.12+
4. **Veb-brauzer**: Google Chrome, Microsoft Edge, Opera yoki Brave (Web Speech API va WebGL 2.0 qo'llab-quvvatlaydigan brauzerlar)
5. **Uskunalar**: Veb-kamera va mikrofon

---

## 🚀 O'RNATISH (INSTALLATION)

### 1. Barcha bog'liqliklarni o'rnatish

Loyihaning ildiz papkasida quyidagi skriptni ikki marta bosing:
```cmd
scripts\install-all.bat
```
yoki terminal orqali qo'lda o'rnating:

#### Backend va Windows Agent uchun:
```bash
python -m pip install -r backend/requirements.txt
python -m pip install -r windows-agent/requirements.txt
```

#### Frontend uchun:
```bash
cd frontend
npm install
```

---

## ⚙️ AI KALITLARINI SOZLASH (CONFIGURATION)

`backend/.env.example` faylidan nusxa olib `backend/.env` faylini yarating:

```env
# Server sozlamalari
HOST=127.0.0.1
PORT=8000

# AI Provayderi: "groq", "openai", "openrouter", "gemini", yoki "ollama"
AI_PROVIDER=groq

# O'zingizning API kalitingizni kiriting:
GROQ_API_KEY=gsk_...
# OPENAI_API_KEY=sk-...
# GEMINI_API_KEY=AIza...

# Model nomi
AI_MODEL=llama-3.3-70b-versatile
```

> **Eslatma:** Agar siz API kalit kiritmasangiz ham, JARVIS to'xtab qolmaydi! U o'rnatilgan lokal intellektual qoidalar yadrosi orqali o'zbek tilida javob beradi, vaqtni aytadi, Windows agenti va qo'l harakatlarini to'liq bajara oladi.

---

## ⚡ TIZIMNI ISHGA TUSHIRISH

### Usul 1: Hammasini bitta tugma bilan ishga tushirish (Tavsiya etiladi)
Loyiha papkasidagi skriptni bosing:
```cmd
scripts\start-all.bat
```
Ushbu skript avtomatik ravishda:
1. Windows Agentini `http://127.0.0.1:8001` da ishga tushiradi.
2. AI Backendini `http://127.0.0.1:8000` da ishga tushiradi.
3. Frontendni `http://localhost:5173` da ishga tushiradi va brauzerda ochadi.

---

### Usul 2: Har bir modulni alohida ishga tushirish

1. **Windows Desktop Agenti**:
   ```cmd
   scripts\start-agent.bat
   ```
   *(yoki: `cd windows-agent && python -m uvicorn agent.main:app --host 127.0.0.1 --port 8001`)*

2. **AI Backend**:
   ```cmd
   scripts\start-backend.bat
   ```
   *(yoki: `cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`)*

3. **Frontend**:
   ```cmd
   scripts\start-frontend.bat
   ```
   *(yoki: `cd frontend && npm run dev`)*

Brauzerda oching: **`http://localhost:5173`**

---

## ✋ IKKALA QO'L IMO-ISHORALARINI TEKSHIRISH (GESTURE CONTROLS)

Kamera panelidagi **"Kamerani yoqish"** tugmasini bosing va brauzer so'raganda kameraga ruxsat bering.

| Imo-ishora (Gesture) | Tavsif | Natija |
| :--- | :--- | :--- |
| **Ko'rsatkich barmog'i ochiq** | Index finger extended | 3D fazoda barmoq uchi koordinatalari bo'yicha yaltirab chizish |
| **Chimchilash (Pinch)** | Bosh barmoq va ko'rsatkich uchi yaqin | 3D reaktorni ushlash va fazoda erkin siljitish |
| **Ikki qo'l masofasi (Distance)** | Ikkala qo'lni uzoqlashtirish yoki yaqinlashtirish | 3D reaktor hajmini masshtablash (Scale) |
| **Ikki qo'l burchagi (Angle)** | Qo'llarni bir-biriga nisbatan burish | 3D reaktorni fazoda aylantirish (Rotate) |
| **Ochiq kaft (Open Palm)** | Barcha 5 ta barmoq ochiq | Chizishni to'xtatish (Pauza) va ushlangan obyektni qo'yib yuborish |
| **Musht (Closed Fist)** | Barmoqlar bukilgan | Chizish rejimini vaqtincha muzlatish yoki almashtirish |

### 3D Chizish paneli imkoniyatlari:
- **Shakllar**: Erkin chiziq (Freehand), Doira (Circle), Uchburchak (Triangle), To'rtburchak (Rectangle).
- **Ranglar**: Chap qo'l (pushti/binafsha) va O'ng qo'l (elektrik moviy/tsian) uchun mustaqil rang tanlash.
- **Tozalash**: "Tozalash" tugmasi barcha chizilgan shakllarni o'chiradi.
- **Tiklash**: "Sahnani tiklash" tugmasi 3D reaktorni markazga va dastlabki hajmga qaytaradi.

---

## 🎙️ OVOZLI YORDAMCHI (VOICE ASSISTANT)

1. Muloqot panelidagi **Mikrofon** tugmasini bosing.
2. O'zbek tilida gapiring, masalan:
   - *"Salom JARVIS, ahvollaring qanday?"*
   - *"Soat nechi bo'ldi?"*
   - *"Notepadni ochib ber"*
   - *"Kalkulyatorni och"*
   - *"Nimalar qila olasan?"*
3. JARVIS javobni ekranda yozadi va ovozli tarzda o'qib eshittiradi.
4. Agar gapirishni to'xtatmoqchi bo'lsangiz, ekranda paydo bo'ladigan sariq **"To'xtatish"** tugmasini bosing.
5. Ovozni butunlay o'chirish uchun yuqori paneldagi dinamik (Mute) belgisini bosing.

---

## 🛡️ WINDOWS AGENTI VA XAVFSIZLIK

Windows agenti faqat `127.0.0.1` (localhost) manzilida ishlaydi va tashqi internetga ochilmaydi.
- Ruxsat etilgan ilovalar ro'yxati (Allowlist):
  - `notepad`: Windows Bloknot dasturi
  - `calc`: Windows Kalkulyator dasturi
  - `browser_url`: Foydalanuvchi tasdiqlagan veb-sayt (faqat `http://` va `https://`)
- **Tasdiqlash oynasi**: JARVIS yoki foydalanuvchi Windows dasturini ochmoqchi bo'lganida, ekranda tasdiqlash oynasi chiqadi. Foydalanuvchi "Tasdiqlash" tugmasini bosmaguncha ilova ishga tushmaydi.
- **Autentifikatsiya**: Dastur birinchi marta ishga tushganda `windows-agent/jarvis_token.txt` faylida xavfsiz tasodifiy token hosil qilinadi va barcha so'rovlar ushbu token orqali tekshiriladi.

---

## ❓ TEZ-TEZ UCHRAYDIGAN XATOLAR VA YECHIMLAR

### 1. "Kameradan foydalanishga brauzerda ruxsat berilmadi"
- **Sababi**: Brauzer kamera ruxsatini bloklagan.
- **Yechim**: Brauzer manzil qatori (URL) chap tomonidagi qulf yoki sozlama belgisini bosing va "Camera" (Kamera) bandiga "Allow" (Ruxsat berish) ni tanlang, so'ng sahifani yangilang (`F5`).

### 2. "Web Speech API qo'llab-quvvatlanmaydi"
- **Sababi**: Ayrim brauzerlar (masalan eski Firefox versiyalari) ovoz aniqlashni qo'llab-quvvatlamaydi.
- **Yechim**: Google Chrome yoki Microsoft Edge brauzeridan foydalaning. Yoki muloqot panelidagi klaviatura maydonidan matn kiritish orqali foydalaning.

### 3. "Windows agenti ishga tushmagan (127.0.0.1:8001)"
- **Sababi**: `windows-agent` dasturi hali ishga tushirilmagan.
- **Yechim**: `scripts\start-agent.bat` faylini ishga tushiring yoki `scripts\start-all.bat` orqali hamma xizmatlarni qayta yoqing.

### 4. "FastAPI backend ulanmadi"
- **Sababi**: Python backend porti (8000) band yoki server to'xtatilgan.
- **Yechim**: `scripts\start-backend.bat` faylini ishga tushiring va konsoldagi xabarni tekshiring.

---

## 🔒 KAMERA VA MIKROFONNI O'CHIRISH

- **Kamerani o'chirish**: Kamera panelidagi qizil **"O'chirish"** tugmasini bosing. Dastur veb-kameraning barcha faol oqimlarini (video tracks) darhol to'xtatadi va apparat datchigi o'chadi.
- **Mikrofonni o'chirish**: Muloqot panelidagi mikrofon tugmasini bosing yoki yuqori o'ng burchakdagi Mute tugmasini faollashtiring.

---

## 🏗️ LOYIHA TUZILISHI

```
jarvis/
├── frontend/                     # React + TypeScript + Vite + Tailwind frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── hud/              # Futuristik HUD boshqaruv panellari
│   │   │   ├── camera/           # MediaPipe veb-kamera va skelet komponenti
│   │   │   ├── gesture/          # 3D chizish va imo-ishoralar sozlamalari
│   │   │   ├── voice/            # O'zbekcha ovozli muloqot va STT/TTS
│   │   │   ├── agent/            # Windows agenti tasdiqlash modali
│   │   │   └── settings/         # Tizim va AI sozlamalari
│   │   ├── three/                # 3D gologramma, reaktor yadrosi va fazoviy chiziqlar
│   │   ├── hooks/                # useHandTracking va useVoiceAssistant
│   │   ├── services/             # Backend va agent API mijozlari
│   │   └── types/                # TypeScript interfeyslari
│   └── package.json
├── backend/                      # Python FastAPI AI Backend
│   ├── app/
│   │   ├── api/                  # Chat va tizim holati endpointlari
│   │   ├── models/               # Pydantic ma'lumotlar sxemalari
│   │   ├── services/             # Groq, OpenAI, Gemini va lokal AI xizmati
│   │   ├── database.py           # SQLite persistent xabarlar tarixi
│   │   └── main.py               # Asosiy FastAPI serveri (127.0.0.1:8000)
│   ├── test_backend.py           # Backend avtomatlashtirilgan testlari
│   ├── requirements.txt
│   └── .env.example
├── windows-agent/                # Mahalliy xavfsiz Windows agenti
│   ├── agent/
│   │   ├── actions.py            # Allowlist buyruqlar (Notepad, Calc, URL)
│   │   └── main.py               # Token himoyalangan agent API (127.0.0.1:8001)
│   ├── test_agent.py             # Agent xavfsizlik va telemetriya testlari
│   ├── requirements.txt
│   └── start-agent.bat
├── scripts/                      # Windows avtomatik ishga tushirish skriptlari
│   ├── start-all.bat             # Hammasini birgalikda ishga tushirish
│   ├── start-dev.bat             # Dasturchi rejimi
│   ├── start-backend.bat         # Faqat backendni ishga tushirish
│   ├── start-frontend.bat        # Faqat frontendni ishga tushirish
│   └── install-all.bat           # Paketlarni o'rnatish
└── README.md                     # Ushbu to'liq qo'llanma
```

JARVIS tizimidan unumli foydalanishingizni tilaymiz!
