# Divide — Collaborative Bill Splitter

Divide is a lightweight, responsive, and collaborative bill-splitting web application. Designed for friends, housemates, travelers, or colleagues, it allows users to add a bill, specify participants and their payments, split costs using multiple modes, and instantly calculate the minimum number of transactions needed to settle up—all without creating an account or experiencing password-related friction.

This project was built as a trial task for **Digital Heroes**.

---

## 🚀 Live Demo & Links

*   **Live App (Vercel):** [https://digital-heroes-omega.vercel.app/](https://digital-heroes-omega.vercel.app/)
*   **API Service (Render):** [https://digitalhereos.onrender.com](https://digitalhereos.onrender.com)
*   **GitHub Repository:** [AdwithSatya/DigitalHereos](https://github.com/AdwithSatya/DigitalHereos.git)

### 📌 Developer Information
*   **Full Name:** Remani Satya Adwith
*   **Contact Email:** [adwithsatya2007@gmail.com](mailto:adwithsatya2007@gmail.com)
*   **Attribution:** Built for [Digital Heroes](https://digitalheroesco.com)

---

## ✨ Features

*   **⚡ Zero-Friction User Flow:** The interactive 4-step wizard guides you from inputting the bill name to settling debts in under 30 seconds.
*   **👥 Multiuser Access & Collaboration:**
    *   Save your bill to generate a unique ID (`?billId=X`).
    *   Share the URL with friends. Anyone opening the link is routed directly to the **Results** screen.
    *   Collaborators can view live splits, refresh to fetch updates, make adjustments, and update the shared bill.
*   **🧮 4 Flexible Split Modes:**
    1.  **Equal:** Split the expense evenly among all members.
    2.  **Custom Amount:** Assign exact custom cash amounts to each person.
    3.  **By Percentage:** Allocate custom percentages with a quick "Distribute Remainder" helper.
    4.  **Itemized:** Input specific line items and assign them to participants using visual interaction chips.
*   **📉 Transaction Minimization:** Integrates a greedy settlement optimization algorithm to drastically reduce the number of peer-to-peer transfers required.
*   **📜 History Drawer:** Quickly review and switch between previously created or loaded bills stored locally.
*   **🎨 Premium UI/UX:** Built with a modern glassmorphic theme, responsive grids, custom SVG micro-interactions, dark mode aesthetics, and WCAG AA accessibility color contrast.

---

## 🛠️ Tech Stack & Architecture

### Frontend
*   **React 19** & **Vite** (fast build times, hot module replacement).
*   **Vanilla CSS** utilizing modern layout features (CSS grid, flexbox, variable transitions) and custom OKLCH/HSL palettes.
*   **Vercel Routing:** Configuration via `vercel.json` for seamless Single Page Application (SPA) redirects.

### Backend
*   **FastAPI (Python 3.11):** High-performance backend endpoints with automatic Swagger docs.
*   **SQLAlchemy ORM:** Used for mapping data models to python classes.
*   **SQLite:** Serverless relational database, perfect for lightweight, zero-maintenance storage.

---

## 📁 Repository Directory Structure

```text
├── backend/                  # Python FastAPI backend
│   ├── routes/
│   │   └── bills.py          # CRUD route handlers
│   ├── database.py           # SQLite connection & session maker
│   ├── main.py               # FastAPI server application & CORS configuration
│   ├── models.py             # SQLAlchemy schemas/models
│   ├── schemas.py            # Pydantic validation schemas
│   └── requirements.txt      # Python dependencies list
│
├── bill-splitter/            # React + Vite frontend
│   ├── public/               # Public assets and favicon
│   ├── src/
│   │   ├── components/       # Wizard steps and drawer components
│   │   ├── utils/            # Calculation logic and API settings
│   │   ├── App.jsx           # Main application engine & step router
│   │   ├── index.css         # Typography, layout tokens, and UI styles
│   │   └── main.jsx          # React entry point
│   ├── vercel.json           # SPA rewrites config for Vercel
│   └── package.json          # Node dependencies & run scripts
│
├── render.yaml               # Infrastructure configuration for Render.com
└── README.md                 # Document describing the project
```

---

## ⚙️ Local Development Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Python 3.10+] (https://www.python.org/)

### 1. Run the Backend
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Start the FastAPI development server:
    ```bash
    uvicorn main:app --reload --host 127.0.0.1 --port 8000
    ```
    The API will be available at `http://127.0.0.1:8000`. You can inspect the interactive Swagger docs at `http://127.0.0.1:8000/docs`.

### 2. Run the Frontend
1.  Open a new terminal and navigate to the `bill-splitter` directory:
    ```bash
    cd bill-splitter
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Launch the Vite development server:
    ```bash
    npm run dev
    ```
    The application will run locally at `http://localhost:5173`.

---

## 📡 API Reference

All requests and responses use JSON formatting. The API base path is prefix-routed under `/api`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/health` | Returns API status (`{"status": "ok"}`). |
| **GET** | `/api/bills` | Retrieves a list of all bills, ordered by creation date (descending). |
| **POST** | `/api/bills` | Creates a new bill record. Returns the generated object. |
| **GET** | `/api/bills/{bill_id}` | Retrieves details for a specific bill using its database ID. |
| **PUT** | `/api/bills/{bill_id}` | Updates details of an existing shared bill. |
| **DELETE** | `/api/bills/{bill_id}` | Deletes a bill from the database. |

---

## ☁️ Deployment Instructions

### Backend (Render)
This project is configured for easy deployment on **Render's Free Tier** using the `render.yaml` file:
1.  Connect your GitHub repository to Render.
2.  Create a **Web Service** pointing to your repository.
3.  Render will read the environment configuration from `render.yaml` automatically:
    *   **Root Directory:** `backend`
    *   **Build Command:** `pip install -r requirements.txt`
    *   **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4.  *(Optional)* Define the `ALLOWED_ORIGINS` environment variable to include your production Vercel frontend domain (e.g., `https://your-app.vercel.app`), enabling secure CORS communication.

### Frontend (Vercel)
The React application is ready for deployment on **Vercel's Free Hobby Plan**:
1.  Import your repository into Vercel.
2.  Set the **Root Directory** configuration to `bill-splitter`.
3.  Leave the Build and Install commands as default (Vite is detected automatically).
4.  Configure the following **Environment Variable**:
    *   `VITE_API_URL`: Your live Render Web Service URL with the `/api` prefix (e.g., `https://digitalhereos.onrender.com/api`).
5.  Click **Deploy**. The `vercel.json` file ensures that direct URLs containing `?billId=` route correctly to `/index.html` where React can handle dynamic URL parameters on startup.
