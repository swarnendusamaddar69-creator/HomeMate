# HomeMate — AI Household Operating System

HomeMate is an intelligent household operating system designed around **one shared household brain with three adaptive faces**:
- 👵 **Elder Care Mode**: Warm high-contrast aesthetics (>=48px touch targets), 1-tap "All OK" daily check-in with family notification, daily health & wellness **To-Do Checklist**, pill schedule with taken/skip tracking, and automatic refill requests.
- 🎓 **Hostel Flat Mode**: Roommate chore rotation with a **Chai & Samosa Penalty Jar** (₹20 per skip), mess menu vs. ₹50 late-night shelf recipes, and **scannable 1-tap UPI QR codes** for splitting flat expenses.
- 👨‍👩‍👧‍👦 **Family Home Mode**: Real-time collaborative grocery list with category filters, direct **WhatsApp Kirana Export**, 1-tap copy for quick commerce (Blinkit / Zepto / Instamart), chore fairness wheel, and utility bill tracking.
- 📸 **Signature Hero: Live Device Camera & Opaque Dabba Memory**: Direct browser camera access (`getUserMedia`) to scan fridge contents in real-time, detect low stocks, remember stainless steel dabbas (`"Top Shelf steel container = Chana Dal"`), and auto-populate Kirana grocery lists.
- ⚡ **Interactive Widget Center**: Live household climate & comfort sensor widget, Web Speech voice assistant HUD, and an in-app widget architecture guide recommending top open-source libraries.

---

## Architecture & Technology Stack

- **Client (`/client`)**: Vite + React 18 + TypeScript + Tailwind CSS + Lucide Icons + `qrcode` + HTML5 MediaDevices API + Web Speech API. Supports PWA offline persistence via localStorage.
- **Server (`/server`)**: Fastify + Node.js + TypeScript + Zod schema validation. Multimodal AI endpoints with Google Gemini integration & local high-fidelity fallback engine.
- **Localization**: Default **English (en)**, with native support for **Hindi (हिंदी)** and **Bengali (বাংলা)**, including Hinglish/Banglish food synonym normalization (`aloo` ➔ `Potato`, `doodh` ➔ `Milk`).

---

## Getting Started

### 1. Install Dependencies
```bash
# Root
npm install

# Server
cd server && npm install

# Client
cd client && npm install
```

### 2. Start Both Services in Development

You can start both frontend and backend concurrently from the root directory:
```bash
npm run dev
```

Or run them in separate terminals:
```bash
# Terminal 1: Fastify Backend (Port 4000)
cd server
npm run dev

# Terminal 2: React Frontend (Port 3000)
cd client
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## Interactive Widgets & Suggestions

HomeMate provides a built-in **Widget Center & Architecture Suggestions** modal accessible from the top navigation bar. It recommends industry-standard libraries:
- **Environmental Data**: Open-Meteo REST API (free, zero API keys required).
- **Icons & Status**: Lucide React (`lucide-react`).
- **Payments & QR**: `qrcode` / `qrcode.react` with standard NPCI UPI URI schemes.
- **Camera & Multimodal Vision**: Native `navigator.mediaDevices.getUserMedia` + HTML5 Canvas.
- **Voice Recognition**: Web Speech API (`webkitSpeechRecognition` & `SpeechSynthesis`).
- **Dashboard Charts**: Tremor (`@tremor/react`) & Recharts.

---

## Environment Variables (Optional)

Create a `.env` file in `/server`:
```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/homemate
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If no Gemini API key is provided, HomeMate uses its built-in realistic multimodal vision engine so all camera and voice features work offline!)*
