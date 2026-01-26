# בחירת טכנולוגיות והמלצות

## עקרונות הבחירה

1. **קוד פתוח** - כל הכלים צריכים להיות Open Source
2. **חינמי** - ללא עלות רישוי
3. **אחסון עצמי** - Self-hosted על שרתים שלנו
4. **פשטות** - קל להתקנה ותחזוקה
5. **תמיכה בעברית** - RTL מלא

---

## סיכום ההמלצות

| רכיב | המלצה ראשונה | חלופה |
|------|-------------|--------|
| Backend | **Node.js + Express** | Python + FastAPI |
| Database | **PostgreSQL** | MariaDB |
| Frontend | **React + Vite** | Vue.js |
| UI Library | **Tailwind CSS** | Chakra UI |
| Auth | **JWT + bcrypt** | Passport.js |
| File Storage | **Local + S3 Compatible** | MinIO |
| Deployment | **Docker Compose** | PM2 + Nginx |

---

## Backend

### אופציה 1: Node.js + Express (מומלץ)

**יתרונות:**
- ביצועים טובים
- קהילה ענקית
- TypeScript support מצוין
- קל ללמוד ולתחזק
- הרבה ספריות זמינות

**חבילות מומלצות:**
```json
{
  "dependencies": {
    "express": "^4.18.x",
    "pg": "^8.11.x",
    "bcrypt": "^5.1.x",
    "jsonwebtoken": "^9.0.x",
    "multer": "^1.4.x",
    "helmet": "^7.1.x",
    "cors": "^2.8.x",
    "express-validator": "^7.0.x",
    "winston": "^3.11.x"
  },
  "devDependencies": {
    "typescript": "^5.3.x",
    "@types/express": "^4.17.x",
    "nodemon": "^3.0.x",
    "jest": "^29.7.x"
  }
}
```

### אופציה 2: Python + FastAPI

**יתרונות:**
- פשוט וקריא
- Auto-generated API docs
- Async support מובנה
- Type hints

**חסרונות:**
- ביצועים קצת נמוכים יותר
- פחות מפתחי Frontend מכירים

---

## Database

### PostgreSQL (מומלץ מאוד)

**יתרונות:**
- יציבות גבוהה
- JSONB לשדות דינמיים
- Full-text search בעברית
- הרשאות מתקדמות
- חינמי לחלוטין

**הגדרות מומלצות:**
```sql
-- Hebrew full-text search
CREATE TEXT SEARCH CONFIGURATION hebrew (COPY = simple);

-- Connection pooling
max_connections = 100
shared_buffers = 256MB
```

### חלופה: MariaDB/MySQL

- פופולרי יותר
- קל יותר להתחיל
- פחות תכונות מתקדמות

---

## Frontend

### React + Vite (מומלץ)

**יתרונות:**
- הכי פופולרי בשוק
- ביצועים מעולים עם Vite
- הרבה components מוכנים
- TypeScript support מצוין

**חבילות מומלצות:**
```json
{
  "dependencies": {
    "react": "^18.2.x",
    "react-dom": "^18.2.x",
    "react-router-dom": "^6.20.x",
    "@tanstack/react-query": "^5.x",
    "axios": "^1.6.x",
    "react-hook-form": "^7.48.x",
    "zod": "^3.22.x",
    "@headlessui/react": "^1.7.x",
    "react-hot-toast": "^2.4.x"
  },
  "devDependencies": {
    "vite": "^5.0.x",
    "@vitejs/plugin-react": "^4.2.x",
    "typescript": "^5.3.x",
    "tailwindcss": "^3.3.x",
    "autoprefixer": "^10.4.x",
    "postcss": "^8.4.x"
  }
}
```

### חלופה: Vue.js

- קל יותר ללמוד
- קהילה קטנה יותר
- פחות components מוכנים

---

## UI/CSS

### Tailwind CSS (מומלץ מאוד)

**יתרונות:**
- Utility-first - מהיר לפיתוח
- RTL support מובנה
- Customization קל
- Bundle size קטן (purge)
- לא צריך לחשוב על שמות classes

**הגדרת RTL:**
```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Heebo', 'Assistant', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

```html
<!-- index.html -->
<html dir="rtl" lang="he">
```

### Component Libraries

**Headless UI** (מומלץ עם Tailwind):
- Accessible components
- לא מגיע עם styling
- Dropdown, Modal, Listbox, etc.

**חלופה - Shadcn/ui:**
- מבוסס Radix UI
- Copy-paste components
- Tailwind styling

---

## Authentication

### JWT + bcrypt (מומלץ)

**זרימה:**
```
1. User logs in with email/password
2. Server validates against bcrypt hash
3. Server generates JWT token
4. Client stores token in httpOnly cookie
5. Each request includes token
6. Server validates token on protected routes
```

**הגדרות אבטחה:**
```javascript
// JWT config
const JWT_SECRET = process.env.JWT_SECRET; // מפתח ארוך וייחודי
const JWT_EXPIRY = '24h';

// bcrypt rounds
const SALT_ROUNDS = 12;

// Cookie settings
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
};
```

---

## File Storage

### Local Storage + S3-Compatible (מומלץ)

**לפיתוח:**
- אחסון מקומי בתיקייה `/uploads`
- הגדרת Nginx לשרת הקבצים

**לייצור:**
- MinIO (Self-hosted S3)
- או שירות S3 תואם

**מבנה תיקיות:**
```
/uploads
  /tickets
    /1234
      /abc123.jpg
      /def456.jpg
  /avatars
    /user_1.jpg
```

**Multer Config:**
```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ticketId = req.params.id;
    const dir = `./uploads/tickets/${ticketId}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  }
});
```

---

## Deployment

### Docker Compose (מומלץ)

**יתרונות:**
- הכל בקובץ אחד
- קל לשכפל סביבות
- Portability
- גיבוי פשוט

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/maintenance
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    volumes:
      - uploads:/app/uploads
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=maintenance
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - uploads:/var/www/uploads:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  pgdata:
  uploads:
```

---

## מבנה פרויקט מומלץ

```
maintenance-system/
├── docker-compose.yml
├── .env.example
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── auth.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── tickets.ts
│   │   │   ├── branches.ts
│   │   │   └── users.ts
│   │   ├── controllers/
│   │   │   └── ...
│   │   ├── models/
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── roles.ts
│   │   │   └── validate.ts
│   │   ├── services/
│   │   │   └── ...
│   │   └── utils/
│   │       └── ...
│   └── tests/
│       └── ...
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/
│       │   └── client.ts
│       ├── components/
│       │   ├── common/
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   └── ...
│       │   ├── tickets/
│       │   │   ├── TicketCard.tsx
│       │   │   ├── TicketForm.tsx
│       │   │   └── TicketList.tsx
│       │   └── layout/
│       │       ├── Header.tsx
│       │       ├── Sidebar.tsx
│       │       └── Layout.tsx
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── Login.tsx
│       │   ├── Tickets.tsx
│       │   └── ...
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   └── useTickets.ts
│       ├── context/
│       │   └── AuthContext.tsx
│       ├── types/
│       │   └── index.ts
│       └── styles/
│           └── globals.css
│
├── database/
│   ├── migrations/
│   │   ├── 001_initial.sql
│   │   └── 002_seed.sql
│   └── schema.sql
│
└── nginx/
    └── nginx.conf
```

---

## דרישות חומרה מינימליות

### פיתוח
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD

### ייצור (עד 200 משתמשים)
- CPU: 2 cores
- RAM: 4GB
- Storage: 50GB SSD
- Bandwidth: 100Mbps

### ייצור (200+ משתמשים)
- CPU: 4 cores
- RAM: 8GB
- Storage: 100GB SSD
- Bandwidth: 1Gbps

---

## חלופות למערכות קיימות

אם לא רוצים לפתח מאפס, אפשר להתאים מערכות קיימות:

### 1. Zammad (המקורית)

**מה צריך לשנות:**
- להסתיר רוב התכונות
- לפשט את הממשק
- להגדיר workflows פשוטים
- לבטל email integration
- להתאים הרשאות

**יתרונות:**
- מערכת בשלה
- Multi-tenant
- Reporting מובנה

**חסרונות:**
- כבדה
- מורכבת להתאמה
- דורשת משאבים רבים

### 2. osTicket

**יתרונות:**
- פשוטה יחסית
- PHP (נפוץ)
- קהילה גדולה

**חסרונות:**
- ישנה
- UI לא מודרני
- PHP

### 3. Frappe/ERPNext

**יתרונות:**
- Framework גמיש
- Low-code
- Python

**חסרונות:**
- עקומת למידה גדולה
- Over-engineered למערכת פשוטה

### 4. פיתוח מאפס (מומלץ)

**יתרונות:**
- בדיוק מה שצריך
- ללא bloat
- קל לתחזוקה
- שליטה מלאה

**חסרונות:**
- זמן פיתוח
- צריך לבנות הכל

---

## המלצה סופית

**לפרויקט הזה, אני ממליץ על פיתוח מאפס מכיוון ש:**

1. **הדרישות פשוטות** - מערכת To-Do מתקדמת, לא Helpdesk מלא
2. **אין צורך ב-90% מתכונות Zammad** - התכתבויות, SLA, integrations
3. **קל יותר לתחזק קוד פשוט** - מאשר להילחם במערכת גדולה
4. **ביצועים טובים יותר** - מערכת קלה ומהירה
5. **התאמה מלאה לצרכים** - UI בדיוק כמו שרוצים

**Stack מומלץ סופי:**
```
Frontend:   React 18 + Vite + TypeScript + Tailwind CSS
Backend:    Node.js + Express + TypeScript
Database:   PostgreSQL 16
Auth:       JWT + bcrypt
Deploy:     Docker Compose + Nginx
```

**זמן פיתוח משוער:**
- MVP בסיסי: 2-4 שבועות
- גרסה מלאה: 6-8 שבועות
- עם בדיקות ודיבוג: 8-10 שבועות
