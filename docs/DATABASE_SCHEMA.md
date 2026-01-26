# מודל נתונים - Database Schema

## דיאגרמת ER

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │    branches     │       │   issue_types   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ email           │       │ name            │       │ code            │
│ password_hash   │       │ code            │       │ name            │
│ first_name      │       │ housekeeper_id  │───┐   │ category        │
│ last_name       │       │ has_floors      │   │   │ active          │
│ role            │       │ has_buildings   │   │   └─────────────────┘
│ group_id (FK)   │───┐   │ has_wings       │   │
│ active          │   │   │ active          │   │
│ created_at      │   │   │ created_at      │   │
└─────────────────┘   │   └─────────────────┘   │
        │             │           │             │
        │             │           │             │
        │             │           ▼             │
        │             │   ┌─────────────────┐   │
        │             │   │    tickets      │   │
        │             │   ├─────────────────┤   │
        │             │   │ id (PK)         │   │
        │             │   │ branch_id (FK)  │───┘
        │             │   │ issue_type_id   │
        │             │   │ description     │
        │             │   │ floor           │
        │             │   │ building        │
        │             │   │ wing            │
        │             │   │ room            │
        │             │   │ status          │
        │             │   │ created_by (FK) │◄──────── users
        │             │   │ housekeeper_id  │◄──────── users
        │             │   │ closed_by (FK)  │◄──────── users
        │             │   │ internal_note   │
        │             │   │ created_at      │
        │             │   │ updated_at      │
        │             │   │ closed_at       │
        │             │   └─────────────────┘
        │             │           │
        │             │           │
        │             │           ▼
        │             │   ┌─────────────────┐
        │             │   │ ticket_photos   │
        │             │   ├─────────────────┤
        │             │   │ id (PK)         │
        │             │   │ ticket_id (FK)  │
        │             │   │ file_path       │
        │             │   │ uploaded_by(FK) │◄──────── users
        │             │   │ uploaded_at     │
        │             │   └─────────────────┘
        │             │
        │             ▼
        │     ┌─────────────────┐
        │     │     groups      │
        │     ├─────────────────┤
        └────►│ id (PK)         │
              │ name            │
              │ active          │
              │ created_at      │
              └─────────────────┘
```

---

## טבלאות

### 1. users - משתמשים

```sql
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'secretary',
    group_id        INTEGER REFERENCES groups(id),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_role CHECK (role IN ('secretary', 'housekeeper', 'technician', 'admin'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_group ON users(group_id);
```

| שדה | סוג | חובה | תיאור |
|-----|-----|------|--------|
| id | SERIAL | כן | מזהה ייחודי |
| email | VARCHAR(255) | כן | כתובת אימייל - ייחודית |
| password_hash | VARCHAR(255) | כן | סיסמה מוצפנת |
| first_name | VARCHAR(100) | כן | שם פרטי |
| last_name | VARCHAR(100) | כן | שם משפחה |
| role | VARCHAR(20) | כן | תפקיד: secretary/housekeeper/technician/admin |
| group_id | INTEGER | לא | שיוך לקבוצה |
| active | BOOLEAN | כן | האם המשתמש פעיל |
| created_at | TIMESTAMP | כן | תאריך יצירה |
| updated_at | TIMESTAMP | כן | תאריך עדכון אחרון |

---

### 2. groups - קבוצות

```sql
CREATE TABLE groups (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

| שדה | סוג | חובה | תיאור |
|-----|-----|------|--------|
| id | SERIAL | כן | מזהה ייחודי |
| name | VARCHAR(100) | כן | שם הקבוצה (לדוגמה: "תחזוקה - יעקב") |
| active | BOOLEAN | כן | האם הקבוצה פעילה |
| created_at | TIMESTAMP | כן | תאריך יצירה |

---

### 3. branches - סניפים

```sql
CREATE TABLE branches (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    code            VARCHAR(20) NOT NULL UNIQUE,
    housekeeper_id  INTEGER NOT NULL REFERENCES users(id),
    has_floors      BOOLEAN NOT NULL DEFAULT FALSE,
    has_buildings   BOOLEAN NOT NULL DEFAULT FALSE,
    has_wings       BOOLEAN NOT NULL DEFAULT FALSE,
    floor_options   JSONB,
    building_options JSONB,
    wing_options    JSONB,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT housekeeper_must_be_housekeeper
        CHECK (EXISTS (SELECT 1 FROM users WHERE id = housekeeper_id AND role = 'housekeeper'))
);

CREATE INDEX idx_branches_code ON branches(code);
CREATE INDEX idx_branches_housekeeper ON branches(housekeeper_id);
CREATE INDEX idx_branches_active ON branches(active);
```

| שדה | סוג | חובה | תיאור |
|-----|-----|------|--------|
| id | SERIAL | כן | מזהה ייחודי |
| name | VARCHAR(255) | כן | שם הסניף המלא |
| code | VARCHAR(20) | כן | סמל מוסד - ייחודי |
| housekeeper_id | INTEGER | כן | אב הבית האחראי |
| has_floors | BOOLEAN | כן | האם יש קומות |
| has_buildings | BOOLEAN | כן | האם יש מספר בניינים |
| has_wings | BOOLEAN | כן | האם יש אגפים |
| floor_options | JSONB | לא | רשימת קומות אפשריות |
| building_options | JSONB | לא | רשימת בניינים |
| wing_options | JSONB | לא | רשימת אגפים |
| active | BOOLEAN | כן | האם הסניף פעיל |
| created_at | TIMESTAMP | כן | תאריך יצירה |

**דוגמה ל-JSONB:**
```json
{
  "floor_options": ["קרקע", "קומה 1", "קומה 2", "גג"],
  "building_options": ["בניין מרכזי", "בניין צפוני"],
  "wing_options": ["אגף א", "אגף ב", "אגף ג"]
}
```

---

### 4. issue_types - סוגי תקלות

```sql
CREATE TABLE issue_types (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    category        VARCHAR(50),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    display_order   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_issue_types_code ON issue_types(code);
CREATE INDEX idx_issue_types_active ON issue_types(active);
```

| שדה | סוג | חובה | תיאור |
|-----|-----|------|--------|
| id | SERIAL | כן | מזהה ייחודי |
| code | VARCHAR(20) | כן | קוד קצר (PLUMB, ELEC...) |
| name | VARCHAR(100) | כן | שם מלא |
| category | VARCHAR(50) | לא | קטגוריה לסיווג |
| active | BOOLEAN | כן | האם פעיל |
| display_order | INTEGER | כן | סדר תצוגה ב-Dropdown |
| created_at | TIMESTAMP | כן | תאריך יצירה |

**נתוני התחלה:**
```sql
INSERT INTO issue_types (code, name, category, display_order) VALUES
('PLUMB', 'אינסטלציה', 'תשתיות', 1),
('ELEC', 'חשמל', 'תשתיות', 2),
('AC', 'מיזוג אוויר', 'מיזוג', 3),
('DOOR', 'דלתות', 'נגרות', 4),
('WINDOW', 'חלונות', 'נגרות', 5),
('LOCK', 'מנעולים ומפתחות', 'אבטחה', 6),
('CLEAN', 'ניקיון', 'תחזוקה שוטפת', 7),
('PEST', 'מזיקים', 'תחזוקה שוטפת', 8),
('SAFETY', 'בטיחות', 'בטיחות', 9),
('FURNITURE', 'ריהוט', 'כללי', 10),
('OTHER', 'אחר', 'כללי', 99);
```

---

### 5. tickets - קריאות

```sql
CREATE TABLE tickets (
    id              SERIAL PRIMARY KEY,
    branch_id       INTEGER NOT NULL REFERENCES branches(id),
    issue_type_id   INTEGER NOT NULL REFERENCES issue_types(id),
    description     TEXT NOT NULL,
    floor           VARCHAR(50),
    building        VARCHAR(100),
    wing            VARCHAR(50),
    room            VARCHAR(50),
    status          VARCHAR(20) NOT NULL DEFAULT 'open',
    created_by      INTEGER NOT NULL REFERENCES users(id),
    housekeeper_id  INTEGER NOT NULL REFERENCES users(id),
    closed_by       INTEGER REFERENCES users(id),
    internal_note   TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at       TIMESTAMP,

    CONSTRAINT valid_status CHECK (status IN ('open', 'in_progress', 'closed'))
);

CREATE INDEX idx_tickets_branch ON tickets(branch_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_housekeeper ON tickets(housekeeper_id);
CREATE INDEX idx_tickets_created_by ON tickets(created_by);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- אינדקס משולב לשאילתות נפוצות
CREATE INDEX idx_tickets_housekeeper_status ON tickets(housekeeper_id, status);
```

| שדה | סוג | חובה | תיאור |
|-----|-----|------|--------|
| id | SERIAL | כן | מספר קריאה ייחודי |
| branch_id | INTEGER | כן | סניף |
| issue_type_id | INTEGER | כן | סוג תקלה |
| description | TEXT | כן | תיאור הבעיה |
| floor | VARCHAR(50) | לא | קומה (אם רלוונטי) |
| building | VARCHAR(100) | לא | בניין (אם רלוונטי) |
| wing | VARCHAR(50) | לא | אגף (אם רלוונטי) |
| room | VARCHAR(50) | לא | חדר/כיתה |
| status | VARCHAR(20) | כן | סטטוס: open/in_progress/closed |
| created_by | INTEGER | כן | המזכירה שפתחה |
| housekeeper_id | INTEGER | כן | אב הבית (שיוך אוטומטי) |
| closed_by | INTEGER | לא | מי סגר |
| internal_note | TEXT | לא | הערה פנימית |
| created_at | TIMESTAMP | כן | תאריך פתיחה |
| updated_at | TIMESTAMP | כן | תאריך עדכון |
| closed_at | TIMESTAMP | לא | תאריך סגירה |

---

### 6. ticket_photos - תמונות

```sql
CREATE TABLE ticket_photos (
    id              SERIAL PRIMARY KEY,
    ticket_id       INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    file_path       VARCHAR(500) NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    file_size       INTEGER,
    mime_type       VARCHAR(100),
    uploaded_by     INTEGER NOT NULL REFERENCES users(id),
    uploaded_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_photos_ticket ON ticket_photos(ticket_id);
```

| שדה | סוג | חובה | תיאור |
|-----|-----|------|--------|
| id | SERIAL | כן | מזהה ייחודי |
| ticket_id | INTEGER | כן | קריאה משויכת |
| file_path | VARCHAR(500) | כן | נתיב הקובץ בשרת |
| file_name | VARCHAR(255) | כן | שם הקובץ המקורי |
| file_size | INTEGER | לא | גודל בבייטים |
| mime_type | VARCHAR(100) | לא | סוג הקובץ |
| uploaded_by | INTEGER | כן | מי העלה |
| uploaded_at | TIMESTAMP | כן | תאריך העלאה |

---

### 7. ticket_history - היסטוריית שינויים (אופציונלי)

```sql
CREATE TABLE ticket_history (
    id              SERIAL PRIMARY KEY,
    ticket_id       INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    field_changed   VARCHAR(50) NOT NULL,
    old_value       TEXT,
    new_value       TEXT,
    changed_by      INTEGER NOT NULL REFERENCES users(id),
    changed_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_history_ticket ON ticket_history(ticket_id);
CREATE INDEX idx_ticket_history_changed_at ON ticket_history(changed_at DESC);
```

| שדה | סוג | חובה | תיאור |
|-----|-----|------|--------|
| id | SERIAL | כן | מזהה ייחודי |
| ticket_id | INTEGER | כן | קריאה משויכת |
| field_changed | VARCHAR(50) | כן | שם השדה שהשתנה |
| old_value | TEXT | לא | ערך ישן |
| new_value | TEXT | לא | ערך חדש |
| changed_by | INTEGER | כן | מי שינה |
| changed_at | TIMESTAMP | כן | מתי |

---

## Views (תצוגות)

### תצוגת קריאות מורחבת

```sql
CREATE VIEW tickets_view AS
SELECT
    t.id,
    t.description,
    t.status,
    t.floor,
    t.building,
    t.wing,
    t.room,
    t.internal_note,
    t.created_at,
    t.updated_at,
    t.closed_at,

    -- סניף
    b.id AS branch_id,
    b.name AS branch_name,
    b.code AS branch_code,

    -- סוג תקלה
    it.id AS issue_type_id,
    it.code AS issue_type_code,
    it.name AS issue_type_name,

    -- פותח הקריאה
    creator.id AS created_by_id,
    creator.first_name || ' ' || creator.last_name AS created_by_name,

    -- אב הבית
    hk.id AS housekeeper_id,
    hk.first_name || ' ' || hk.last_name AS housekeeper_name,

    -- סוגר (אם יש)
    closer.id AS closed_by_id,
    closer.first_name || ' ' || closer.last_name AS closed_by_name,

    -- זמן טיפול
    CASE
        WHEN t.closed_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (t.closed_at - t.created_at)) / 3600
        ELSE NULL
    END AS handling_time_hours

FROM tickets t
JOIN branches b ON t.branch_id = b.id
JOIN issue_types it ON t.issue_type_id = it.id
JOIN users creator ON t.created_by = creator.id
JOIN users hk ON t.housekeeper_id = hk.id
LEFT JOIN users closer ON t.closed_by = closer.id;
```

### תצוגת סטטיסטיקות

```sql
CREATE VIEW statistics_view AS
SELECT
    -- כללי
    COUNT(*) AS total_tickets,
    COUNT(*) FILTER (WHERE status = 'open') AS open_tickets,
    COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_tickets,
    COUNT(*) FILTER (WHERE status = 'closed') AS closed_tickets,

    -- היום
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) AS created_today,
    COUNT(*) FILTER (WHERE DATE(closed_at) = CURRENT_DATE) AS closed_today,

    -- השבוע
    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)) AS created_this_week,
    COUNT(*) FILTER (WHERE closed_at >= DATE_TRUNC('week', CURRENT_DATE)) AS closed_this_week,

    -- זמן טיפול ממוצע (בשעות)
    AVG(EXTRACT(EPOCH FROM (closed_at - created_at)) / 3600)
        FILTER (WHERE closed_at IS NOT NULL) AS avg_handling_time_hours

FROM tickets;
```

---

## Triggers (טריגרים)

### עדכון אוטומטי של updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

### עדכון אוטומטי של closed_at

```sql
CREATE OR REPLACE FUNCTION update_closed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
        NEW.closed_at = CURRENT_TIMESTAMP;
    ELSIF NEW.status != 'closed' THEN
        NEW.closed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tickets_closed_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_closed_at();
```

### שיוך אוטומטי של אב בית

```sql
CREATE OR REPLACE FUNCTION auto_assign_housekeeper()
RETURNS TRIGGER AS $$
BEGIN
    SELECT housekeeper_id INTO NEW.housekeeper_id
    FROM branches
    WHERE id = NEW.branch_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tickets_auto_assign
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_housekeeper();
```

---

## אינדקסים נוספים לביצועים

```sql
-- חיפוש טקסט חופשי בתיאור
CREATE INDEX idx_tickets_description_gin ON tickets
    USING gin(to_tsvector('hebrew', description));

-- שאילתות תאריכים
CREATE INDEX idx_tickets_created_date ON tickets(DATE(created_at));
CREATE INDEX idx_tickets_closed_date ON tickets(DATE(closed_at));
```

---

## נתוני בדיקה (Seed Data)

```sql
-- קבוצות
INSERT INTO groups (name) VALUES
('תחזוקה - יעקב'),
('תחזוקה - משה'),
('תחזוקה - דוד');

-- משתמשים
INSERT INTO users (email, password_hash, first_name, last_name, role, group_id) VALUES
('admin@example.com', '$2a$10$...', 'מנהל', 'ראשי', 'admin', NULL),
('yaakov@example.com', '$2a$10$...', 'יעקב', 'כהן', 'housekeeper', 1),
('moshe@example.com', '$2a$10$...', 'משה', 'לוי', 'housekeeper', 2),
('david@example.com', '$2a$10$...', 'דוד', 'ישראלי', 'technician', 1),
('secretary1@example.com', '$2a$10$...', 'שרה', 'אברהם', 'secretary', NULL),
('secretary2@example.com', '$2a$10$...', 'רחל', 'יצחק', 'secretary', NULL);

-- סניפים
INSERT INTO branches (name, code, housekeeper_id, has_floors) VALUES
('גן ילדים רמה א גן 3', '343319', 2, FALSE),
('יסודי בית שמש', '560300', 2, TRUE),
('תיכון הרצליה', '123456', 3, TRUE);

-- עדכון אופציות לסניף עם קומות
UPDATE branches
SET floor_options = '["קרקע", "קומה 1", "קומה 2"]'::jsonb
WHERE code = '560300';
```
