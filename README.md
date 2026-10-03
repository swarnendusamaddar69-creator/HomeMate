# 🏡 HomeMate — AI Household Operating System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-home--mate--zeta.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://home-mate-zeta.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React%2018-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)

> **Live Production Web OS**: [https://home-mate-zeta.vercel.app/](https://home-mate-zeta.vercel.app/)

**HomeMate** is a real-world, intelligent household operating system crafted around **one shared household brain with three adaptive living interfaces**. Whether managing a busy family home, co-living in a shared flat / student hostel, or supporting senior citizens living independently, HomeMate unifies inventory, chores, finances, and wellness into a single, cohesive operating experience.

---

## 🌟 Key Living Interfaces

### 👨‍👩‍👧‍👦 1. Family Home Living
- **Collaborative Kirana & Grocery Hub**: Real-time pantry tracking with low-stock alerts, category sorting, and multi-user sync.
- **Quick Commerce Dispatch**: Direct 1-tap export to **Zepto** (10-min), **Blinkit** (8-min), and **Instamart**, plus instant WhatsApp grocery lists for local Kirana stores.
- **Fair Household Chores & Points Leaderboard**: Gamified responsibility tracking across family members with points and completion histories.
- **Monthly Household Expense Calculator**: Unified breakdown of groceries, utilities, rent, and domestic maintenance.

### 🎓 2. Shared Flat & Student Living (Hostel)
- **Built-in Splitwise & UPI Settlements**: Group expense splitting with instant NPCI UPI QR code generation (`gpay://`, `phonepe://`, `paytm://`).
- **Chore Penalty Jar**: Accountability system for flatmate chores with fun skip penalties (e.g., Chai & Samosa pool).
- **Mess Menu & Late-Night Shelf Recipes**: Daily hostel mess tracking with 1-tap skip alerts and shelf-stable quick snack recipes.
- **Multi-Tenant Roommate Sync**: Isolate your flat with a custom 6-character household code for private sharing.

### 🧓 3. Senior & Elder Care
- **High-Contrast, Accessible UI**: Clean typography, high-contrast visual cues, and oversized touch targets (≥48px).
- **Daily Wellness & Routine Checklist**: Structured daily schedules for hydration, vitals check, walks, and family calls.
- **Smart Medicine Schedule & Stock Refill**: Morning/afternoon/night pill reminders with refill thresholds and WhatsApp prescription dispatch to trusted chemists.
- **1-Tap "All OK" Family Notification**: Instant peace of mind with 1-tap check-ins alerting designated family contacts.

---

## ⚡ Signature Real-World Features

- **📸 Multimodal Fridge & Dabba Memory**: Direct browser camera access (`getUserMedia`) to scan real refrigerators and opaque containers (*"Top Shelf steel dabba = Chana Dal"*), automatically populating grocery restock lists.
- **🎙️ Web Speech AI HUD**: Hands-free voice commands in English, Hindi, and Bengali to add groceries or check tasks while cooking.
- **🔐 Real-World Multi-Tenant Authentication**:
  - Secure personal registration (Name, Email, Password, Locality).
  - Create a new household or join an existing flat using a 6-character access code.
  - Per-household data isolation with persistent localStorage & backend API synchronization.
- **🌐 Trilingual Localization**: Full support for **English**, **हिंदी (Hindi)**, and **বাংলা (Bengali)** with smart Indian grocery synonym recognition (`aloo` ➔ `Potato`, `doodh` ➔ `Milk`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Web OS** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, QRcode |
| **Media & Hardware APIs** | HTML5 MediaDevices (`getUserMedia`), Canvas API, Web Speech Recognition & Synthesis |
| **Backend Service** | Fastify, Node.js, TypeScript, Zod validation |
| **AI Vision Engine** | Google Gemini Multimodal API with fallback realistic vision engine |
| **Hosting & CI/CD** | **Vercel** (Frontend SPA), Node.js / Docker (Backend API) |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 1. Clone the Repository
```bash
git clone https://github.com/swarnendusamaddar69-creator/HomeMate.git
cd HomeMate
```

### 2. Install Dependencies
```bash
# Install root, server, and client dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Configure Environment Variables (Optional)
Create `server/.env` based on `server/.env.example`:
```env
PORT=4000
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If no Gemini API key is configured, HomeMate runs with its built-in realistic multimodal engine so all features work seamlessly offline).*

### 4. Run the Development Server
```bash
# Starts both frontend (port 3000) and backend (port 4000) concurrently
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## ☁️ Deployment

### Deploying to Vercel (Frontend)
1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set the **Root Directory** to `client`.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Deploy! HomeMate is live at [https://home-mate-zeta.vercel.app/](https://home-mate-zeta.vercel.app/).

---

## 📄 License
MIT License. Built for modern, stress-free households.
