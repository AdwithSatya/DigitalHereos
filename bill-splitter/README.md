# Divide — React Frontend Client

This directory houses the client-side Single Page Application (SPA) for **Divide**, built on React 19 and Vite.

---

## 🎨 Design System & Styling
The frontend utilizes a customized **Vanilla CSS** design system defined in `src/index.css`. Key features include:
*   **Harmonious Color Palette:** Designed using semantic CSS variables with tailored dark-mode HSL tokens.
*   **Glassmorphism Card Layouts:** Uses frosted-glass transparency layers (`backdrop-filter`) for premium visual depth.
*   **Micro-animations:** Smooth scale transitions, hover effects, and step indicators guide the user through calculations.
*   **Responsive Grids:** Adapts instantly across mobile screen sizes and desktop viewports.

---

## 📂 Component Architecture & Structure

```text
├── public/                 # Static assets & favicons
├── src/
│   ├── components/         # Interactive UI Components
│   │   ├── BillForm.jsx      # Step 1: Input bill name, total, and optional description
│   │   ├── PeopleManager.jsx # Step 2: Manage participants and input paid amounts
│   │   ├── SplitConfig.jsx   # Step 3: Interactive selectors for the 4 split modes
│   │   ├── ResultsView.jsx   # Step 4: settlement summaries, save/sync status, and share banner
│   │   ├── StepIndicator.jsx # Wizard progress path visual tracker
│   │   └── HistoryDrawer.jsx # Slide-in tray displaying local/recent bills log
│   │
│   ├── utils/              # Helper utilities
│   │   ├── api.js            # Base URL resolution using environment variables
│   │   └── calculator.js     # Core split calculations and transaction minimizer
│   │
│   ├── App.jsx             # Main state coordinator, router, and API orchestrator
│   ├── index.css           # CSS variables, typography, component styling tokens
│   └── main.jsx            # Entry mount point
```

---

## ⚙️ How the 4 Split Modes Work (`SplitConfig.jsx` & `calculator.js`)

1.  **Equal:** Splits the total cost evenly among all participants.
2.  **Custom Amount:** Assigns exact custom amounts to individuals. Includes a validation check to verify the sum matches the bill total.
3.  **By Percentage:** Allocates shares based on percentage values. A "Distribute Remainder" action automatically splits leftover percentage fractional points equally.
4.  **Itemized:** Allows entering individual items, their cost, and assigning who shared each item via dynamic select chips. Supports splitting items among multiple select individuals.

---

## 📉 Settlement Minimization Algorithm
Implemented in `src/utils/calculator.js`, the transaction settlement algorithm converts debts into net balances:
1.  Computes each person's net balance (amount paid minus amount owed).
2.  Splits participants into two groups: **Creditors** (positive net balance) and **Debtors** (negative net balance).
3.  Iterates greedy matches matching the largest debtor to the largest creditor, resolving the smaller amount first, and updating balances until net values settle to zero.
4.  Produces a minimized list of transactions needed to settle all debts.

---

## 🛠️ Scripts & Build

In this folder, you can run:

*   **`npm install`**: Installs dependencies.
*   **`npm run dev`**: Starts the local development server at `http://localhost:5173`.
*   **`npm run build`**: Compiles the optimized production bundle under `dist/`.
*   **`npm run lint`**: Lints Javascript source files for code quality.
