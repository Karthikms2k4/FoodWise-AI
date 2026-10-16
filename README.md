# FoodWise AI 🥑🌱

> **AI-Powered Pantry Inventory Intelligence, Smart Expiry Tracking & Zero-Waste Culinary Engine**

FoodWise AI bridges kitchen workflows with everyday consumer habits to eliminate household food waste. Powered by **Gemini 3.8 Flash** and **Firebase Firestore**, FoodWise AI tracks grocery shelf life, provides real-time expiry alerts, computes sustainability impact metrics, and synthesizes high-protein, zero-waste recipes using ingredients that need to be rescued before they spoil.

---

## ✨ Features

### 📊 1. Real-Time Pantry Dashboard
- **Trichromatic Shelf-Life Semantics**: Unambiguous status indicators across **Fresh & Optimal**, **Expiring Soon (1–3 days)**, and **Expired (Needs Action)**.
- **Location Categorization**: Filter by storage zone: *Fridge Crisper*, *Fridge Top Shelf*, *Fridge Door*, *Freezer*, *Counter Basket*, and *Pantry Shelf*.
- **Quick Action Workflow**: One-tap actions to mark items as consumed/eaten, freeze items to extend shelf life by 30 days, or discard spoiled items.

### 🤖 2. Gemini 3.8 Flash AI Recipe Agent
- **Expiring Food Priority**: The AI culinary co-pilot automatically selects and prioritizes items nearing expiration (e.g., Organic Baby Spinach, Vine Ripe Tomatoes).
- **Protein Customization**: Target specific protein goals (`15g+`, `25g+`, `35g+`, `45g+`) with calculated amino acid and macronutrient profiles.
- **Configurable Batching**: Generates 1, 2, or 3 distinct recipes simultaneously based on available pantry items and dietary preferences (*High Protein*, *Under 15 Mins*, *Vegetarian*, *Low Carb*).
- **One-Tap Cooking & Deduction**: Interactive step-by-step cooking walkthrough with integrated timers; automatically deducts consumed ingredients from your live Firestore pantry upon completion.

### 📷 3. Computer Vision & Barcode Scanning
- **AI Food Scan**: Simulated optical recognition powered by vision prompts to detect multiple produce items on your counter, assign freshness grades, and batch-import them to your pantry.
- **Barcode Scanner**: Laser-viewfinder simulator with instant grocery product lookup and automatic shelf-life calculation.

### ☁️ 4. Firebase Authentication & Firestore Persistence
- **Google Sign-In**: Integrated authentication with Firebase Auth popup flow (`signInWithPopup`).
- **Real-Time Synchronization**: Live Firestore subscriptions (`onSnapshot`) keep inventory, sustainability milestones, and alerts synced across sessions.
- **Zero-Trust ABAC Security Rules**: Hardened `firestore.rules` preventing update gaps, enforcing document ownership, and isolating PII.
- **Offline Resilient**: Built-in mock data seeding for instant out-of-the-box exploration without mandatory sign-in.

### 🌍 5. Eco Milestones & Sustainability Metrics
- **Eco Score (0–100)**: Evaluates proactive grocery management and waste mitigation.
- **CO2 Emissions Prevented**: Quantifies kilograms of greenhouse gas emissions diverted from landfills.
- **Dollar Savings Tracker**: Aggregates money saved by consuming groceries before spoiling.

### 🌗 6. Calibrated Light & Dark Theme
- **Light Mode**: Pristine milk-white surfaces (`#faf8ff`), crisp slate typography, and fresh verdant produce accents.
- **Dark Mode**: Deep obsidian canvas (`#0b0f19`), elevated container cards (`#131b2e`), and radiant emerald highlights.
- **Quick Switch**: 1-click Sun ☀️ / Moon 🌙 toggle in the top navigation header and persistent settings in the Profile tab.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/) |
| **Icons & Motion** | [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/) |
| **Backend & AI** | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [@google/genai SDK](https://www.npmjs.com/package/@google/genai) (`gemini-3.8-flash`) |
| **Database & Auth** | [Firebase Firestore](https://firebase.google.com/docs/firestore), [Firebase Authentication](https://firebase.google.com/docs/auth) |
| **Bundler & Tooling** | [Vite 8](https://vitejs.dev/), [TSX](https://github.com/privatenumber/tsx) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- A Google Gemini API Key configured in your environment

### Environment Setup

Create or verify `.env` in the root directory:

```bash
# Gemini API Key for server-side AI Recipe Agent
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Optional App URL for production deployment
APP_URL="http://localhost:3000"
```

### Installation

```bash
# Install dependencies
npm install
```

### Running the Full-Stack Application

The dev command starts the Express backend with embedded Vite middlewares on port 3000:

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Building for Production

```bash
# Type check and build Vite frontend bundle
npm run build

# Start production server
npm run start
```

---

## 📁 Project Structure

```text
├── firebase-applet-config.json  # Firebase client credentials
├── firebase-blueprint.json      # Intermediate Representation (IR) schema
├── firestore.rules              # Deployed Firestore security rules
├── index.html                   # HTML entry point with Plus Jakarta Sans fonts
├── package.json                 # Project dependencies and full-stack scripts
├── server.ts                    # Express server with /api/ai/recipes Gemini endpoint
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite & Tailwind CSS v4 plugin configuration
└── src/
    ├── main.tsx                 # React DOM mount point
    ├── index.css                # Global styles, fonts, and dark mode variant
    ├── App.tsx                  # Root state coordinator and navigation router
    ├── assets/images/           # High-fidelity culinary photographic assets
    ├── components/
    │   ├── Header.tsx           # Sticky top bar with logo, sync status & theme toggle
    │   ├── MetricCard.tsx       # 2x2 dashboard status metric cards
    │   ├── RecipeSpotlight.tsx  # Shakshuka cook-before-spoiling card
    │   ├── ExpiringList.tsx     # Critical shelf-life items list
    │   ├── MilestoneCard.tsx    # Monthly CO2 & food waste progress banner
    │   ├── BottomNav.tsx        # Bottom tab navigation with elevated plus button
    │   ├── AIRecipeAgentModal.tsx # Gemini multi-recipe & protein synthesis agent
    │   ├── AddFoodModal.tsx     # Grocery intake modal with auto shelf-life calculation
    │   ├── BarcodeScannerModal.tsx # Interactive camera barcode scanner
    │   ├── AIFoodScannerModal.tsx  # AI computer vision produce scanner
    │   ├── NotificationsModal.tsx  # Shelf-life warnings & alert drawer
    │   ├── RecipeDetailModal.tsx   # Step-by-step cooking guide & pantry deduction
    │   ├── PantryView.tsx       # Full 34-item inventory explorer with filters
    │   ├── RecipesView.tsx      # High-protein zero-waste recipe catalog
    │   └── ProfileView.tsx      # User profile, theme switcher & Firestore settings
    ├── data/
    │   └── mockData.ts          # Baseline 34 pantry items, recipes & alerts
    ├── lib/
    │   └── firebase.ts          # Firebase Auth, Firestore real-time subscriptions & CRUD
    └── types/
        └── food.ts              # TypeScript interfaces for FoodItem, Recipe, and UserProfile
```

---

## 🔒 Security & Data Integrity

- **PII Isolation**: User profiles and emails are restricted to verified document owners (`isOwner(userId)`).
- **Strict Size & Schema Checks**: String lengths, collection keys, and relational IDs are validated using `isValidId()` and `hasAll()` rules.
- **Client Offline Protection**: Diagnostic error wrapper (`handleFirestoreError`) logs structured errors conforming to standard error specifications.

---

## 📄 License

Apache-2.0
