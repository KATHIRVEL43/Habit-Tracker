# Aesthetic Habit Tracker (FastAPI + MongoDB + React + TypeScript)

A full-stack, production-quality Habit Tracker crafted to match the **Aesthetic Plum & Blush Pink Bullet Journal** design with complete daily, weekly, and monthly tracking, circular donut progress gauges, 0.00%–80.00% velocity area curves, and full authentication (Google OAuth + Email Sign In & Sign Up + 1-Click Demo).

---

## 🎨 Visual Design Highlights (Matching Reference Images)

1. **Header & Typography**:
   - Fluid cursive script title **"Habit Tracker"** in rich deep plum (`#8D2D5B`).
   - Month & Year switcher with quick "Today" navigation.
   - User profile dropdown and "+ Add Habit" modal trigger.

2. **Top Analytics Section (Image 1)**:
   - **Circular Donut Gauge**: Lavender track ring (`#D7C7E1`) with deep plum progress arc (`#8D2D5B`), dynamic **Total Completed %** in center with subtitle.
   - **Daily Velocity Area Curve**: Y-axis scaled from `0.00%` to `80.00%`, soft pink gradient fill, vibrant pink curve line (`#EE78A7`), and distinct pink dots on each day (1 to 31).

3. **Daily Habits Table (Image 1)**:
   - Columns: `#`, `Daily Habits`, days `1` to `31`, `TOTAL` count, and `% COMPLETED` horizontal plum bar charts (`#8D2D5B`).
   - Custom Pink Checkboxes: soft pink border (`#F3A8C7`) with white checkmark when completed.
   - Bottom Summary Bar: Lavender row (`#DFD2E6`) with daily total completion counts, and the **peak day** (highest completed count) highlighted in bold plum (`#8D2D5B`) with white text.

4. **Weekly & Monthly Habits Tables (Image 2)**:
   - **Weekly Habits**: Columns `#`, `Weekly Habits`, `Week 1`, `Week 2`, `Week 3`, `Week 4`, `Week 5` with interactive checkboxes.
   - **Monthly Habits**: Columns `#`, `Monthly Habits`, `Done` with interactive checkbox.

5. **Authentication**:
   - **Sign In** and **Sign Up (Create Account)** tabs.
   - **Continue with Google** (OAuth 2.0 via Google Identity Services).
   - **1-Click Demo Login** (instantly loads 45 pre-seeded habits & realistic check-in data).

---

## 🛠 Tech Stack

- **Backend**: Python 3.11+, FastAPI, Motor (Async MongoDB), Pydantic v2, Python-Jose (JWT), Passlib / Bcrypt, Uvicorn, Pytest + HTTPX.
- **Database**: MongoDB (Local instance or MongoDB Atlas).
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Axios with JWT refresh interceptors, Recharts, Lucide Icons, Date-fns.

---

## 📦 Permanent Software & Database Setup Guide

### 1. MongoDB Setup (Local Database)
MongoDB is a fast, NoSQL document database.

#### Windows Installation:
1. Download **MongoDB Community Server**:
   - Go to: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Select Windows MSI installer and run it.
   - Leave "Install MongoDB as a Service" checked (this ensures MongoDB starts automatically on Windows boot).
   - Default connection URI: `mongodb://localhost:27017`
2. (Optional GUI) Download **MongoDB Compass**:
   - Allows you to visually explore database collections and documents at `mongodb://localhost:27017`.

#### Verify Local MongoDB:
Run in PowerShell:
```powershell
Get-Service -Name *mongo*
```
You should see:
```
Status   Name       DisplayName
------   ----       -----------
Running  MongoDB    MongoDB Server (MongoDB)
```

---

### 2. Install Required Python Packages (Permanently)
From the `habitsheet/backend` directory:
```powershell
cd "c:\Users\KATHIRVEL\OneDrive\Desktop\Habit Tracker'\habitsheet\backend"
pip install -r requirements.txt
```
Key packages installed:
- `fastapi`, `uvicorn[standard]`
- `motor`, `pymongo`
- `pydantic`, `pydantic-settings`, `email-validator`
- `python-jose[cryptography]`, `passlib[bcrypt]`
- `pytest`, `pytest-asyncio`, `httpx`

---

### 3. Install Frontend Packages (Permanently)
From the `habitsheet/frontend` directory:
```powershell
cd "c:\Users\KATHIRVEL\OneDrive\Desktop\Habit Tracker'\habitsheet\frontend"
npm.cmd install
```

---

## 🚀 How to Run the App

### Step 1: Seed the Database (Optional / First Time)
Populates the demo user (`demo@habitsheet.app`) with 15 Daily Habits, 15 Weekly Habits, 15 Monthly Habits, and realistic check-ins matching the design images:
```powershell
cd "c:\Users\KATHIRVEL\OneDrive\Desktop\Habit Tracker'\habitsheet\backend"
python scripts\seed.py
```

### Step 2: Start the Backend (Terminal 1)
```powershell
cd "c:\Users\KATHIRVEL\OneDrive\Desktop\Habit Tracker'\habitsheet\backend"
uvicorn app.main:app --port 8000 --reload
```
- API Docs: [http://127.0.0.1:8000/api/v1/docs](http://127.0.0.1:8000/api/v1/docs)
- Health: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### Step 3: Start the Frontend (Terminal 2)
```powershell
cd "c:\Users\KATHIRVEL\OneDrive\Desktop\Habit Tracker'\habitsheet\frontend"
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```
- Web Application: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🔑 Google Authentication Configuration

To activate Google Sign-In:
1. Open the [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth Client ID** (Web application).
3. Add `http://localhost:5173` and `http://127.0.0.1:5173` under **Authorized JavaScript origins**.
4. In `habitsheet/frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```
5. Click **"Continue with Google"** on the login page!
