# SpringTrack – Smart Learning & Productivity Tracker


🚀 Live Demo: https://springtrack.vercel.app

🔗 Backend API: https://springtrack-backend.onrender.com

📂 GitHub Repository: https://github.com/Vipulpawar7045/springtrack

A full-stack MERN application for tracking your learning journey with proof-based task verification, streaks, analytics, and more.

---

## 🚀 Features

- ✅ **Task Management** – Create, edit, complete, delete tasks with priority & categories
- 📸 **Proof Upload** – Upload screenshots, notes, PDFs as task completion evidence (Cloudinary)
- 🔥 **Streak Tracking** – Daily streak system for consistency
- 🗺️ **Roadmap Tracker** – Visual learning roadmaps with topic checkboxes
- ⏱️ **Pomodoro Timer** – 25/5 min focus sessions with session history
- 📝 **Study Notes** – Create and search notes with tags
- 🎯 **Goal Setting** – Long-term goals with progress tracking
- 📊 **Analytics** – Charts + study calendar
- 🏆 **Achievements** – Auto-unlocked badges for milestones
- 📄 **PDF Reports** – Downloadable progress reports
- 🌙 **Dark Mode** – Full light/dark theme support
- 🔐 **JWT Auth** – Secure registration, login, protected routes

---

## 📁 Project Structure

```
springtrack/
├── backend/
│   ├── config/          # DB & Cloudinary config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── utils/           # Streak & achievement engines
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    └── src/
        ├── components/  # Reusable UI (Layout, ProofUploadModal)
        ├── context/     # Auth & Theme context
        ├── pages/       # All page components
        ├── utils/       # Axios API instance
        └── App.jsx
```

---

## ⚙️ Setup Instructions

### 1. Clone & install dependencies

```bash
# Backend
cd springtrack/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

Copy the backend `.env.example` to `.env` and fill in your values:

```bash
cd backend
cp .env.example .env
```

Required values:
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Any long random string |
| `CLOUDINARY_CLOUD_NAME` | From cloudinary.com dashboard |
| `CLOUDINARY_API_KEY` | From cloudinary.com dashboard |
| `CLOUDINARY_API_SECRET` | From cloudinary.com dashboard |

### 3. Get your credentials

**MongoDB Atlas (free):**
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free cluster
2. Database Access → Add user with password
3. Network Access → Allow `0.0.0.0/0`
4. Connect → Copy connection string → paste into `MONGO_URI`

**Cloudinary (free):**
1. Go to [cloudinary.com](https://cloudinary.com) → Sign up free
2. Dashboard → Copy Cloud Name, API Key, API Secret

### 4. Run the application

```bash
# Terminal 1 – Backend
cd springtrack/backend
npm run dev
# Runs on http://localhost:5000

# Terminal 2 – Frontend
cd springtrack/frontend
npm start
# Runs on http://localhost:3000
```

### 5. Open the app

Visit **http://localhost:3000** → Register → Start tracking!

---

## 🔑 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |
| GET | `/api/tasks` | Get tasks (filter/search) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id/complete` | Complete task |
| POST | `/api/proofs/upload` | Upload proof file |
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/analytics/weekly` | 7-day data |
| GET | `/api/reports/generate` | Download PDF report |
| ...and more |

---

## 🛠️ Tech Stack

**Frontend:** React.js, Tailwind CSS, React Router v6, Axios, Chart.js, React Calendar, React Hot Toast

**Backend:** Node.js, Express.js, JWT, bcryptjs, Multer, Cloudinary, PDFKit

**Database:** MongoDB Atlas (Mongoose ODM)

---

## 📸 Proof Upload Feature

When you complete a task, a proof upload modal automatically opens. You can:
- Drag & drop or click to browse files
- Upload PNG, JPG, JPEG, or PDF (up to 10MB each)
- Upload multiple files at once
- Add a description to each upload
- View all uploads in the **My Proofs** gallery
- Click any proof to view it full size or download it

---

## 🎯 Achievement System

Achievements are automatically checked and unlocked when you:
- Complete your first task 🏆
- Build streaks (3, 7, 30 days) 🔥
- Log study hours (10, 50, 100) 📚
- Complete tasks milestones (10, 50, 100) 💯
- Upload your first proof 📸

---

Built with ❤️ for learners who want to stay accountable.
