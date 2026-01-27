# API Specification - מפרט ממשקי תכנות

## סקירה כללית

### Base URL
```
https://api.maintenance.example.com/v1
```

### Authentication
כל הבקשות (מלבד login) דורשות Token:
```
Authorization: Bearer <JWT_TOKEN>
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "הצלחה",
  "errors": []
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "message": "שגיאה בבקשה",
  "errors": [
    {
      "field": "email",
      "message": "כתובת אימייל לא תקינה"
    }
  ]
}
```

### HTTP Status Codes
| קוד | משמעות |
|-----|---------|
| 200 | הצלחה |
| 201 | נוצר בהצלחה |
| 400 | בקשה לא תקינה |
| 401 | לא מאומת |
| 403 | אין הרשאה |
| 404 | לא נמצא |
| 422 | שגיאת ולידציה |
| 500 | שגיאת שרת |

---

## 1. Authentication - אימות

### 1.1 התחברות

```http
POST /auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_at": "2026-02-26T15:30:00Z",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "יעקב",
      "last_name": "כהן",
      "role": "housekeeper",
      "group_id": 1,
      "group_name": "תחזוקה - יעקב"
    }
  }
}
```

---

### 1.2 התנתקות

```http
POST /auth/logout
```

**Response (200):**
```json
{
  "success": true,
  "message": "התנתקת בהצלחה"
}
```

---

### 1.3 פרטי המשתמש המחובר

```http
GET /auth/me
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "יעקב",
    "last_name": "כהן",
    "role": "housekeeper",
    "group_id": 1,
    "group_name": "תחזוקה - יעקב",
    "permissions": {
      "can_create_ticket": false,
      "can_view_all_tickets": false,
      "can_manage_users": false,
      "can_manage_branches": false
    }
  }
}
```

---

## 2. Tickets - קריאות

### 2.1 רשימת קריאות

```http
GET /tickets
```

**Query Parameters:**
| פרמטר | סוג | חובה | תיאור |
|-------|-----|------|--------|
| status | string | לא | סינון לפי סטטוס: open, in_progress, closed |
| branch_id | integer | לא | סינון לפי סניף |
| housekeeper_id | integer | לא | סינון לפי אב בית (admin בלבד) |
| issue_type_id | integer | לא | סינון לפי סוג תקלה |
| from_date | date | לא | מתאריך (YYYY-MM-DD) |
| to_date | date | לא | עד תאריך (YYYY-MM-DD) |
| page | integer | לא | עמוד (ברירת מחדל: 1) |
| per_page | integer | לא | פריטים בעמוד (ברירת מחדל: 20, מקסימום: 100) |
| sort | string | לא | שדה למיון: created_at, updated_at, status |
| order | string | לא | סדר: asc, desc (ברירת מחדל: desc) |

**הרשאות:**
- מזכירה: רואה רק את הקריאות שלה
- אב בית / טכנאי: רואה רק קריאות משויכות אליו
- מנהל: רואה הכל

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 1234,
        "description": "ברז מטפטף בכיור",
        "status": "open",
        "status_display": "פתוח",
        "floor": "קומה 1",
        "building": null,
        "wing": null,
        "room": "כיתה ג2",
        "created_at": "2026-01-25T10:30:00Z",
        "updated_at": "2026-01-25T10:30:00Z",
        "closed_at": null,
        "branch": {
          "id": 1,
          "name": "יסודי בית שמש",
          "code": "560300"
        },
        "issue_type": {
          "id": 1,
          "code": "PLUMB",
          "name": "אינסטלציה"
        },
        "created_by": {
          "id": 5,
          "name": "שרה אברהם"
        },
        "housekeeper": {
          "id": 2,
          "name": "יעקב כהן"
        },
        "has_photos": false
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_pages": 5,
      "total_items": 95
    }
  }
}
```

---

### 2.2 פרטי קריאה בודדת

```http
GET /tickets/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1234,
    "description": "ברז מטפטף בכיור",
    "status": "in_progress",
    "status_display": "בטיפול",
    "floor": "קומה 1",
    "building": null,
    "wing": null,
    "room": "כיתה ג2",
    "internal_note": "הזמנתי חלק חדש",
    "created_at": "2026-01-25T10:30:00Z",
    "updated_at": "2026-01-26T08:15:00Z",
    "closed_at": null,
    "branch": {
      "id": 1,
      "name": "יסודי בית שמש",
      "code": "560300"
    },
    "issue_type": {
      "id": 1,
      "code": "PLUMB",
      "name": "אינסטלציה"
    },
    "created_by": {
      "id": 5,
      "name": "שרה אברהם"
    },
    "housekeeper": {
      "id": 2,
      "name": "יעקב כהן"
    },
    "closed_by": null,
    "photos": []
  }
}
```

---

### 2.3 יצירת קריאה חדשה

```http
POST /tickets
```

**הרשאות:** מזכירה בלבד

**Request:**
```json
{
  "branch_id": 1,
  "issue_type_id": 1,
  "description": "ברז מטפטף בכיור",
  "floor": "קומה 1",
  "building": null,
  "wing": null,
  "room": "כיתה ג2"
}
```

**Validation:**
| שדה | כללים |
|-----|--------|
| branch_id | חובה, קיים בטבלת סניפים |
| issue_type_id | חובה, קיים וסטטוס פעיל |
| description | חובה, 5-1000 תווים |
| floor | אופציונלי, רק אם הסניף תומך |
| building | אופציונלי, רק אם הסניף תומך |
| wing | אופציונלי, רק אם הסניף תומך |
| room | אופציונלי, עד 50 תווים |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1235,
    "description": "ברז מטפטף בכיור",
    "status": "open",
    "status_display": "פתוח",
    "created_at": "2026-01-26T15:30:00Z",
    "branch": {
      "id": 1,
      "name": "יסודי בית שמש",
      "code": "560300"
    },
    "housekeeper": {
      "id": 2,
      "name": "יעקב כהן"
    }
  },
  "message": "הקריאה נפתחה בהצלחה"
}
```

---

### 2.4 עדכון סטטוס קריאה

```http
PATCH /tickets/:id/status
```

**הרשאות:** אב בית / טכנאי / מנהל

**Request:**
```json
{
  "status": "in_progress"
}
```

**Validation:**
| שדה | כללים |
|-----|--------|
| status | חובה, אחד מ: open, in_progress, closed |

**מעברים מותרים:**
- `open` → `in_progress`
- `open` → `closed`
- `in_progress` → `closed`
- `in_progress` → `open` (החזרה)
- `closed` → `open` (פתיחה מחדש - admin בלבד)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1234,
    "status": "in_progress",
    "status_display": "בטיפול",
    "updated_at": "2026-01-26T15:45:00Z"
  },
  "message": "הסטטוס עודכן בהצלחה"
}
```

---

### 2.5 הוספת הערה פנימית

```http
PATCH /tickets/:id/note
```

**הרשאות:** אב בית / טכנאי / מנהל

**Request:**
```json
{
  "internal_note": "הזמנתי חלק חדש, יגיע מחר"
}
```

**Validation:**
| שדה | כללים |
|-----|--------|
| internal_note | אופציונלי, עד 1000 תווים |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1234,
    "internal_note": "הזמנתי חלק חדש, יגיע מחר",
    "updated_at": "2026-01-26T15:50:00Z"
  },
  "message": "ההערה נשמרה"
}
```

---

### 2.6 העלאת תמונה

```http
POST /tickets/:id/photos
Content-Type: multipart/form-data
```

**הרשאות:** אב בית / טכנאי / מנהל

**Request (form-data):**
| שדה | סוג | תיאור |
|-----|-----|--------|
| photo | file | קובץ תמונה (jpg, png, webp) |

**Validation:**
- סוגים: jpg, jpeg, png, webp
- גודל מקסימלי: 10MB
- מקסימום תמונות לקריאה: 5

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "ticket_id": 1234,
    "file_name": "completion_photo.jpg",
    "url": "/uploads/tickets/1234/abc123.jpg",
    "uploaded_at": "2026-01-26T16:00:00Z",
    "uploaded_by": {
      "id": 2,
      "name": "יעקב כהן"
    }
  },
  "message": "התמונה הועלתה בהצלחה"
}
```

---

### 2.7 מחיקת תמונה

```http
DELETE /tickets/:id/photos/:photo_id
```

**הרשאות:** אב בית / טכנאי / מנהל (רק מי שהעלה או admin)

**Response (200):**
```json
{
  "success": true,
  "message": "התמונה נמחקה"
}
```

---

## 3. Branches - סניפים

### 3.1 רשימת סניפים

```http
GET /branches
```

**Query Parameters:**
| פרמטר | סוג | חובה | תיאור |
|-------|-----|------|--------|
| active | boolean | לא | סינון לפי פעיל/לא פעיל |
| housekeeper_id | integer | לא | סינון לפי אב בית |
| search | string | לא | חיפוש בשם או קוד |

**הרשאות:** כולם (מזכירה רואה רק שם וקוד)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "יסודי בית שמש",
      "code": "560300",
      "has_floors": true,
      "has_buildings": false,
      "has_wings": false,
      "floor_options": ["קרקע", "קומה 1", "קומה 2"],
      "building_options": null,
      "wing_options": null,
      "active": true,
      "housekeeper": {
        "id": 2,
        "name": "יעקב כהן"
      }
    }
  ]
}
```

---

### 3.2 פרטי סניף

```http
GET /branches/:id
```

**Response (200):** דומה לפריט ברשימה

---

### 3.3 יצירת סניף

```http
POST /branches
```

**הרשאות:** מנהל בלבד

**Request:**
```json
{
  "name": "גן ילדים חדש",
  "code": "999999",
  "housekeeper_id": 2,
  "has_floors": true,
  "floor_options": ["קרקע", "קומה 1"],
  "has_buildings": false,
  "has_wings": false
}
```

**Response (201):** הסניף שנוצר

---

### 3.4 עדכון סניף

```http
PUT /branches/:id
```

**הרשאות:** מנהל בלבד

**Request:** דומה ליצירה

**Response (200):** הסניף המעודכן

---

### 3.5 ביטול סניף

```http
DELETE /branches/:id
```

**הרשאות:** מנהל בלבד

**הערה:** לא מוחק באמת, רק מסמן כלא פעיל.

**Response (200):**
```json
{
  "success": true,
  "message": "הסניף בוטל"
}
```

---

## 4. Issue Types - סוגי תקלות

### 4.1 רשימת סוגי תקלות

```http
GET /issue-types
```

**Query Parameters:**
| פרמטר | סוג | חובה | תיאור |
|-------|-----|------|--------|
| active | boolean | לא | רק פעילים (ברירת מחדל: true) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "PLUMB",
      "name": "אינסטלציה",
      "category": "תשתיות",
      "active": true
    },
    {
      "id": 2,
      "code": "ELEC",
      "name": "חשמל",
      "category": "תשתיות",
      "active": true
    }
  ]
}
```

---

### 4.2 ניהול סוגי תקלות

```http
POST /issue-types
PUT /issue-types/:id
DELETE /issue-types/:id
```

**הרשאות:** מנהל בלבד

---

## 5. Users - משתמשים

### 5.1 רשימת משתמשים

```http
GET /users
```

**הרשאות:** מנהל בלבד

**Query Parameters:**
| פרמטר | סוג | חובה | תיאור |
|-------|-----|------|--------|
| role | string | לא | סינון לפי תפקיד |
| active | boolean | לא | סינון לפי פעיל |
| group_id | integer | לא | סינון לפי קבוצה |
| search | string | לא | חיפוש בשם או אימייל |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "email": "yaakov@example.com",
      "first_name": "יעקב",
      "last_name": "כהן",
      "full_name": "יעקב כהן",
      "role": "housekeeper",
      "role_display": "אב בית",
      "group": {
        "id": 1,
        "name": "תחזוקה - יעקב"
      },
      "active": true,
      "created_at": "2026-01-01T00:00:00Z",
      "branches_count": 3
    }
  ]
}
```

---

### 5.2 יצירת משתמש

```http
POST /users
```

**הרשאות:** מנהל בלבד

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "first_name": "משה",
  "last_name": "לוי",
  "role": "secretary",
  "group_id": null
}
```

---

### 5.3 עדכון משתמש

```http
PUT /users/:id
```

**הרשאות:** מנהל בלבד

---

### 5.4 שינוי סיסמה

```http
POST /users/:id/password
```

**הרשאות:** מנהל או המשתמש עצמו

**Request:**
```json
{
  "current_password": "OldPass123",
  "new_password": "NewSecurePass456!"
}
```

---

### 5.5 ביטול משתמש

```http
DELETE /users/:id
```

**הרשאות:** מנהל בלבד

**הערה:** לא מוחק באמת, רק מסמן כלא פעיל.

---

## 6. Groups - קבוצות

### 6.1 רשימת קבוצות

```http
GET /groups
```

**הרשאות:** מנהל בלבד

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "תחזוקה - יעקב",
      "active": true,
      "members_count": 3
    }
  ]
}
```

---

### 6.2 ניהול קבוצות

```http
POST /groups
PUT /groups/:id
DELETE /groups/:id
```

**הרשאות:** מנהל בלבד

---

## 7. Statistics - סטטיסטיקות

### 7.1 סטטיסטיקות כלליות

```http
GET /statistics
```

**הרשאות:** מנהל בלבד

**Query Parameters:**
| פרמטר | סוג | חובה | תיאור |
|-------|-----|------|--------|
| from_date | date | לא | מתאריך |
| to_date | date | לא | עד תאריך |
| branch_id | integer | לא | סניף ספציפי |
| housekeeper_id | integer | לא | אב בית ספציפי |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totals": {
      "all": 1250,
      "open": 45,
      "in_progress": 12,
      "closed": 1193
    },
    "today": {
      "created": 8,
      "closed": 5
    },
    "this_week": {
      "created": 42,
      "closed": 38
    },
    "this_month": {
      "created": 156,
      "closed": 148
    },
    "average_handling_time_hours": 18.5,
    "by_issue_type": [
      {
        "issue_type": "אינסטלציה",
        "count": 320
      },
      {
        "issue_type": "חשמל",
        "count": 280
      }
    ],
    "by_branch": [
      {
        "branch": "יסודי בית שמש",
        "open": 5,
        "in_progress": 2,
        "closed": 120
      }
    ],
    "by_housekeeper": [
      {
        "housekeeper": "יעקב כהן",
        "open": 15,
        "in_progress": 5,
        "closed": 450,
        "avg_handling_time_hours": 16.2
      }
    ]
  }
}
```

---

### 7.2 דשבורד אב בית

```http
GET /statistics/my-dashboard
```

**הרשאות:** אב בית / טכנאי / מנהל

**Response (200):**
```json
{
  "success": true,
  "data": {
    "open_tickets": 12,
    "in_progress_tickets": 3,
    "closed_today": 4,
    "closed_this_week": 18,
    "tickets_by_branch": [
      {
        "branch": "יסודי בית שמש",
        "open": 5,
        "in_progress": 2
      }
    ]
  }
}
```

---

## 8. Webhooks & Events (אופציונלי)

### Event Types

| Event | תיאור |
|-------|--------|
| ticket.created | קריאה חדשה נוצרה |
| ticket.status_changed | סטטוס השתנה |
| ticket.closed | קריאה נסגרה |
| ticket.photo_added | תמונה הועלתה |

### Webhook Payload

```json
{
  "event": "ticket.created",
  "timestamp": "2026-01-26T15:30:00Z",
  "data": {
    "ticket_id": 1235,
    "branch_id": 1,
    "housekeeper_id": 2
  }
}
```

---

## Rate Limiting

| תפקיד | בקשות לדקה |
|-------|------------|
| secretary | 30 |
| housekeeper | 60 |
| technician | 60 |
| admin | 120 |

**Response (429):**
```json
{
  "success": false,
  "message": "חרגת ממגבלת הבקשות. נסה שוב בעוד 30 שניות.",
  "retry_after": 30
}
```

---

## OpenAPI/Swagger

מסמך OpenAPI מלא זמין ב:
```
GET /openapi.json
GET /docs (Swagger UI)
```
