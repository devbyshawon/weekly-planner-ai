# Weekly Planner AI

> An AI-powered personal weekly planner that understands plain English. Type *"Gym at 6pm every Monday and Wednesday"* — it parses the time, recurrence, and category automatically and places it on the right slots of a Google-Calendar-style weekly grid.

Built as a full-stack MERN project. The NLP engine is fully custom (no paid AI API) — it runs locally, costs nothing, and works offline.

---

## Features

| Feature | Details |
|---|---|
| **AI prompt input** | Type a sentence → AI extracts time, recurrence, and category |
| **Weekly grid** | Sat→Fri columns, hour-by-hour time ruler, events positioned by exact clock time |
| **Daily agenda view** | Single-day timeline, switchable with one click |
| **Recurring events** | Daily / specific weekdays / custom day combinations |
| **Prayer time auto-fetch** | One click adds all 5 daily prayers (Fajr→Isha) for Dhaka using the free Aladhan API |
| **Browser notifications** | Fires a reminder at the actual event time, no backend required |
| **Conflict detection** | Overlapping events highlighted in red automatically |
| **Analytics dashboard** | Hours by category (recharts), completion rate, weekly summary |
| **Search & filter** | Filter by keyword or category in real time |
| **Export** | Download the visible week as PNG or PDF |
| **PWA** | Installable on desktop and mobile, works offline |
| **Auth** | JWT-based register/login, cloud sync across devices |
| **Dark / light theme** | Persisted to localStorage |

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS v4
- React Router v6
- Recharts (analytics)
- html-to-image + jsPDF (export)
- Lucide React (icons)

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT auth (jsonwebtoken + bcryptjs)
- chrono-node (date/time extraction)

**AI / NLP Engine** *(custom-built, no API key, fully free)*
- chrono-node for time/date extraction
- Custom regex layer for recurrence detection ("every weekday", "every Mon and Thu")
- Keyword-based category inference (prayer / study / gym / freelance / personal)
- 37 unit tests using Node's built-in test runner

---

## Project Structure

```
weekly-planner-ai/
├── backend/
│   ├── config/db.js
│   ├── models/              User.js, Event.js
│   ├── controllers/         authController.js, eventController.js
│   ├── routes/              authRoutes, eventRoutes, parseRoutes
│   ├── middleware/          JWT auth guard
│   ├── utils/
│   │   ├── parser.js        NLP engine (chrono-node + custom logic)
│   │   ├── recurrenceEngine.js   Expands rules → concrete occurrences
│   │   └── validateEvent.js      Input validation
│   ├── seed.js              Demo data script
│   └── server.js
└── frontend/
    └── src/
        ├── api/             Axios instance + event API wrappers
        ├── context/         Auth, Events, Theme contexts
        ├── components/      WeeklyGrid, DailyAgenda, EventModal,
        │                    PromptBar, AnalyticsDashboard, Toolbar,
        │                    PrayerTimePanel, SearchBar, EventBlock
        ├── pages/           Login, Register, Dashboard
        └── utils/           dateHelpers, categories, notifications,
                             prayerTimes, exportUtils, conflictDetector
```

---

## Local Setup

**Prerequisites:** Node.js 18+, a free [MongoDB Atlas](https://mongodb.com/cloud/atlas) cluster

**Backend**
```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm install
npm run dev        # http://localhost:5001
```

**Frontend**
```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5001/api (already set)
npm install
npm run dev        # http://localhost:5173
```

**Seed demo data (optional)**
```bash
cd backend
npm run seed
# Login: demo@weeklyplanner.ai / demo123456
```

**Run backend tests (37 tests, no DB needed)**
```bash
cd backend
npm test
```

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full guide.

**Short version:** Render (backend) + Vercel (frontend) + MongoDB Atlas (DB) — all free tiers.

---

## About

Built by **Md. Shawon Hossain (Arham)** — final-year CSE student at BRAC University, working on an IEEE-targeted Vision-Language Model thesis (CascadeVLM).

This project demonstrates: full MERN stack architecture, custom NLP/AI engine design, real-world UX decisions (conflict detection, exception handling, offline support), and production deployment.
