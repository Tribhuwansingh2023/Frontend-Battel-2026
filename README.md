# Aura AI - Next-Gen Data Automation Platform

## 📖 Description
Aura AI is a premium, high-converting, responsive landing page for an advanced AI-driven data automation platform. It was built exclusively for the **FrontEnd Battle 3.0 - VibeCoding Competition (Phase 1)** organized by the Web and Design Society, IIT Bhubaneswar. This project demonstrates strict adherence to architectural integrity, engineering speed, motion choreography, and SEO hygiene under a rigid 4-hour countdown.

## ℹ️ About
This repository contains the Round 1 qualifying submission. It features a complete integration of all provided assets, dynamic matrix-driven pricing calculation, and a zero-dependency Bento-to-Accordion wrapper that seamlessly handles state context locking across fluid breakpoints.

## 🔗 Links
- **GitHub Repository:** [Tribhuwansingh2023/Aura-Builder](https://github.com/Tribhuwansingh2023/Aura-Builderarmory-frontend-battle-2026-iit-bhubaneswar)
- **Live Deployment:** [View Live Site](https://aura-builderarmory-frontend-battle-2026-iit-bhubaneswar.vercel.app/) *(Or your custom Vercel/Netlify link)*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Tribhuwansingh2023/Aura-Builderarmory-frontend-battle-2026-iit-bhubaneswar)

---

## 🚀 Hackathon Features Implementation

### Feature 1: Matrix-Driven Pricing & Performance-Isolated Currency Switcher
- **Blueprint:** A pricing tier component toggling between Monthly and Annual billing (with a 20% discount multiplier) across INR (₹), USD ($), and EUR (€).
- **Data Logic:** Dynamically computed final values using a multi-dimensional configuration matrix (no hardcoded UI values).
- **State Isolation:** **Strict adherence to the zero global re-render rule.** Changing the currency dropdown or billing toggle isolates state updates exclusively to the targeted text nodes without layout thrashing or global component reflows.

### Feature 2: Bento-to-Accordion Wrapper with State Persistence
- **Blueprint:** Core features presented via a modern Bento-Grid layout on desktop, refactoring into a fluid, touch-optimized Accordion list on mobile viewports.
- **Context Lock Constraint:** Programmatic index context tracking ensures that resizing the browser window past the mobile breakpoint transfers the exact active hover state into the open accordion panel smoothly.
- **Zero-Dependency Rule:** **Strictly zero external runtime animation engines** (no Framer Motion, no Headless UI) were used for this feature. All transitions use hardware-accelerated native CSS and WAAPI.

### UI/UX & SEO
- **Semantic HTML:** Clean `<main>`, `<header>`, `<section>`, and `<article>` tags over deep `<div>` nesting.
- **SEO Hygiene:** Fully configured meta headers, Open Graph (OG) tags, accessible attributes, and crawlable nodes.
- **Motion Accuracy:** Replicated hover micro-interactions (150ms-200ms ease-out) and structural layout reflows (300ms-400ms ease-in-out) from the design specifications.

---

## 🛠 Tech Stack

- **Framework:** React / Vite (TypeScript)
- **Styling:** Tailwind CSS (Utility CSS allowed by guidelines)
- **Backend/Auth:** Supabase (for user management & data)

---

## 💻 Running Locally

### Prerequisites
- Node.js (v18+)
- npm, yarn, pnpm, or bun

### Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-link>
   cd aura-builder
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## 🔐 Test Users (Authentication)

This project integrates with Supabase for authentication. You can use the following test users to explore authenticated areas of the platform (like the Dashboard).

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin User** | `admin@aura.ai` | `AuraAdmin2026!` |
| **Pro User** | `pro@aura.ai` | `AuraPro2026!` |
| **Basic User** | `test@aura.ai` | `AuraTest2026!` |

*(Note: If the test users are not initialized on your local environment, you can quickly seed them using the provided setup script below).*

### Creating Test Users Automatically

We have included a setup script to instantly seed the test users into your Supabase instance. 

1. Ensure your `.env` file has the correct Supabase credentials (`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`).
2. Run the user creation script:

```bash
npm run seed:users
# OR
node --env-file=.env scripts/create-test-users.js
```

---

## 📜 Submission Details

- **Format:** Online
- **Performance Cap:** The initial loading sequence executes well within the strict 500ms orchestration threshold without delaying TTI.
- **Responsive Breakpoints:** Flawless fluid transitions across Mobile, Tablet, and Desktop viewports.

Good luck with the evaluation! Feel free to raise an issue if you encounter any setup problems.
