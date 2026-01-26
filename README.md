# מערכת ניהול קריאות תחזוקה

מערכת קלה ונעימה לניהול קריאות תחזוקה - פשוטה כמו To-Do, מקצועית כמו Helpdesk.

## תכונות עיקריות:

- **פתיחת קריאה פשוטה** - מזכירות פותחות קריאה ב-3 קליקים
- **שיוך אוטומטי** - הקריאה מוקצית אוטומטית לאב הבית הנכון לפי הסניף
- **טיפול מהיר** - אב הבית משנה סטטוס ומעלה תמונת "בוצע"
- **דשבורד מנהל** - צפייה בכל הקריאות, סטטיסטיקות ודוחות
- **ללא התכתבויות** - המערכת עובדת על סטטוסים בלבד

## עקרונות מנחים

- מינימום קליקים
- מינימום שדות
- אפס בלבול למשתמשים
- To-Do קודם ל-Helpdesk

## התחלה מהירה

### הרצה עם Docker (מומלץ)

```bash
# Clone
git clone <repo-url>
cd service-desk-zammad

# Copy environment file
cp .env.example .env

# Run with Docker Compose
docker-compose up -d

# Access the app at http://localhost
```

### פיתוח מקומי

```bash
# Start database
docker-compose -f docker-compose.dev.yml up -d

# Backend
cd backend
cp ../.env.example .env
npm install
npm run migrate
npm run seed
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### משתמשי בדיקה

| אימייל | סיסמה | תפקיד |
|--------|-------|-------|
| admin@example.com | Admin123! | מנהל |
| yaakov@example.com | Test1234! | אב בית |
| sarah@example.com | Test1234! | מזכירה |

## מבנה הפרויקט

```
service-desk-zammad/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/      # Database & auth config
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Auth, validation
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Helpers
│   └── Dockerfile
├── frontend/             # React + Vite app
│   ├── src/
│   │   ├── api/         # API client
│   │   ├── components/  # React components
│   │   ├── context/     # React context
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   ├── styles/      # CSS
│   │   └── types/       # TypeScript types
│   └── Dockerfile
├── database/
│   └── migrations/       # SQL migrations
├── docs/                 # Documentation
├── docker-compose.yml    # Production config
└── docker-compose.dev.yml # Development config
```

## טכנולוגיות

| רכיב | טכנולוגיה |
|------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 16 |
| Auth | JWT + bcrypt |
| Deploy | Docker Compose |

## API Endpoints

| Method | Endpoint | תיאור |
|--------|----------|-------|
| POST | /api/v1/auth/login | התחברות |
| GET | /api/v1/auth/me | פרטי משתמש |
| GET | /api/v1/tickets | רשימת קריאות |
| POST | /api/v1/tickets | יצירת קריאה |
| PATCH | /api/v1/tickets/:id/status | עדכון סטטוס |
| GET | /api/v1/branches | רשימת סניפים |
| GET | /api/v1/issue-types | סוגי תקלות |

## מסמכי אפיון

| מסמך | תיאור |
|------|-------|
| [PRD.md](docs/PRD.md) | אפיון פונקציונלי מלא |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | מודל הנתונים וטבלאות |
| [API_SPECIFICATION.md](docs/API_SPECIFICATION.md) | מפרט ה-API |
| [UI_UX_DESIGN.md](docs/UI_UX_DESIGN.md) | עיצוב ממשק המשתמש |
| [TECHNOLOGY_STACK.md](docs/TECHNOLOGY_STACK.md) | בחירת טכנולוגיות |

## רישיון

MIT License - קוד פתוח וחינמי לשימוש.
