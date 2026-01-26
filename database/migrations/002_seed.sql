-- Seed data for Maintenance Ticket System

-- Insert groups
INSERT INTO groups (name) VALUES
    ('תחזוקה - יעקב'),
    ('תחזוקה - משה'),
    ('תחזוקה - דוד')
ON CONFLICT (name) DO NOTHING;

-- Insert default issue types
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
    ('OTHER', 'אחר', 'כללי', 99)
ON CONFLICT (code) DO NOTHING;

-- Insert admin user (password: Admin123!)
-- Hash generated with bcrypt rounds=12
INSERT INTO users (email, password_hash, first_name, last_name, role, group_id)
VALUES (
    'admin@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X0.0fYf.1t8q3M.K.',
    'מנהל',
    'ראשי',
    'admin',
    NULL
) ON CONFLICT (email) DO NOTHING;

-- Insert housekeeper users (password for all: Test1234!)
INSERT INTO users (email, password_hash, first_name, last_name, role, group_id)
VALUES
    ('yaakov@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X0.0fYf.1t8q3M.K.', 'יעקב', 'כהן', 'housekeeper', 1),
    ('moshe@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X0.0fYf.1t8q3M.K.', 'משה', 'לוי', 'housekeeper', 2),
    ('david@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X0.0fYf.1t8q3M.K.', 'דוד', 'ישראלי', 'technician', 1)
ON CONFLICT (email) DO NOTHING;

-- Insert secretary users
INSERT INTO users (email, password_hash, first_name, last_name, role, group_id)
VALUES
    ('sarah@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X0.0fYf.1t8q3M.K.', 'שרה', 'אברהם', 'secretary', NULL),
    ('rachel@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X0.0fYf.1t8q3M.K.', 'רחל', 'יצחק', 'secretary', NULL)
ON CONFLICT (email) DO NOTHING;

-- Insert branches (need to use subquery to get housekeeper IDs)
INSERT INTO branches (name, code, housekeeper_id, has_floors, floor_options)
SELECT 'גן ילדים רמה א גן 3', '343319', id, FALSE, NULL
FROM users WHERE email = 'yaakov@example.com'
ON CONFLICT (code) DO NOTHING;

INSERT INTO branches (name, code, housekeeper_id, has_floors, floor_options)
SELECT 'יסודי בית שמש', '560300', id, TRUE, '["קרקע", "קומה 1", "קומה 2"]'::jsonb
FROM users WHERE email = 'yaakov@example.com'
ON CONFLICT (code) DO NOTHING;

INSERT INTO branches (name, code, housekeeper_id, has_floors, floor_options)
SELECT 'תיכון הרצליה', '123456', id, TRUE, '["קרקע", "קומה 1", "קומה 2", "קומה 3"]'::jsonb
FROM users WHERE email = 'moshe@example.com'
ON CONFLICT (code) DO NOTHING;

-- Insert some sample tickets
INSERT INTO tickets (branch_id, issue_type_id, description, floor, room, status, created_by, housekeeper_id)
SELECT
    b.id,
    it.id,
    'ברז מטפטף בכיור של כיתה ג2. המים ממשיכים לטפטף גם כשהברז סגור לגמרי.',
    'קומה 1',
    'כיתה ג2',
    'open',
    u.id,
    b.housekeeper_id
FROM branches b
CROSS JOIN issue_types it
CROSS JOIN users u
WHERE b.code = '560300' AND it.code = 'PLUMB' AND u.email = 'sarah@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO tickets (branch_id, issue_type_id, description, floor, room, status, created_by, housekeeper_id)
SELECT
    b.id,
    it.id,
    'נורה שרופה בכיתה. לא ניתן ללמוד בחושך.',
    'קומה 2',
    'כיתה ד1',
    'in_progress',
    u.id,
    b.housekeeper_id
FROM branches b
CROSS JOIN issue_types it
CROSS JOIN users u
WHERE b.code = '560300' AND it.code = 'ELEC' AND u.email = 'sarah@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO tickets (branch_id, issue_type_id, description, status, created_by, housekeeper_id, closed_at, closed_by)
SELECT
    b.id,
    it.id,
    'מזגן לא מקרר בחדר המורים',
    'closed',
    u.id,
    b.housekeeper_id,
    NOW() - INTERVAL '2 days',
    b.housekeeper_id
FROM branches b
CROSS JOIN issue_types it
CROSS JOIN users u
WHERE b.code = '123456' AND it.code = 'AC' AND u.email = 'rachel@example.com'
ON CONFLICT DO NOTHING;

COMMIT;
