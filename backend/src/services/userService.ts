import { query } from '../config/database';
import { UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';
import { authService } from './authService';
import { roleDisplayNames } from '../utils/helpers';

interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  group_id?: number;
}

interface UpdateUserData {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  group_id?: number | null;
  active?: boolean;
}

export const userService = {
  async getUsers(filters: {
    role?: UserRole;
    active?: boolean;
    group_id?: number;
    search?: string;
  }) {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters.role) {
      conditions.push(`u.role = $${paramIndex++}`);
      params.push(filters.role);
    }
    if (filters.active !== undefined) {
      conditions.push(`u.active = $${paramIndex++}`);
      params.push(filters.active);
    }
    if (filters.group_id) {
      conditions.push(`u.group_id = $${paramIndex++}`);
      params.push(filters.group_id);
    }
    if (filters.search) {
      conditions.push(
        `(u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`
      );
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT
        u.id, u.email, u.first_name, u.last_name, u.role, u.group_id, u.active, u.created_at,
        g.name as group_name,
        (SELECT COUNT(*) FROM branches b WHERE b.housekeeper_id = u.id) as branches_count,
        (SELECT COUNT(*) FROM tickets t WHERE t.created_by = u.id) as tickets_created,
        (SELECT COUNT(*) FROM tickets t WHERE t.housekeeper_id = u.id AND t.status = 'open') as open_tickets
      FROM users u
      LEFT JOIN groups g ON u.group_id = g.id
      ${whereClause}
      ORDER BY u.first_name, u.last_name`,
      params
    );

    return result.rows.map((row) => ({
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      full_name: `${row.first_name} ${row.last_name}`,
      role: row.role,
      role_display: roleDisplayNames[row.role],
      group: row.group_id
        ? {
            id: row.group_id,
            name: row.group_name,
          }
        : null,
      active: row.active,
      created_at: row.created_at,
      branches_count: parseInt(row.branches_count, 10),
      tickets_created: parseInt(row.tickets_created, 10),
      open_tickets: parseInt(row.open_tickets, 10),
    }));
  },

  async getUserById(userId: number) {
    const result = await query(
      `SELECT
        u.id, u.email, u.first_name, u.last_name, u.role, u.group_id, u.active, u.created_at,
        g.name as group_name
      FROM users u
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('משתמש לא נמצא', 404);
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      full_name: `${row.first_name} ${row.last_name}`,
      role: row.role,
      role_display: roleDisplayNames[row.role],
      group: row.group_id
        ? {
            id: row.group_id,
            name: row.group_name,
          }
        : null,
      active: row.active,
      created_at: row.created_at,
    };
  },

  async createUser(data: CreateUserData) {
    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [
      data.email.toLowerCase(),
    ]);
    if (existing.rows.length > 0) {
      throw new AppError('כתובת האימייל כבר קיימת במערכת', 400);
    }

    // Verify group exists if provided
    if (data.group_id) {
      const group = await query('SELECT id FROM groups WHERE id = $1 AND active = true', [
        data.group_id,
      ]);
      if (group.rows.length === 0) {
        throw new AppError('קבוצה לא נמצאה', 400);
      }
    }

    const passwordHash = await authService.hashPassword(data.password);

    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, group_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        data.email.toLowerCase(),
        passwordHash,
        data.first_name,
        data.last_name,
        data.role,
        data.group_id || null,
      ]
    );

    return this.getUserById(result.rows[0].id);
  },

  async updateUser(userId: number, data: UpdateUserData) {
    const existing = await query('SELECT id FROM users WHERE id = $1', [userId]);
    if (existing.rows.length === 0) {
      throw new AppError('משתמש לא נמצא', 404);
    }

    // Check if email is being changed and if it's unique
    if (data.email) {
      const emailCheck = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [
        data.email.toLowerCase(),
        userId,
      ]);
      if (emailCheck.rows.length > 0) {
        throw new AppError('כתובת האימייל כבר קיימת במערכת', 400);
      }
    }

    if (data.group_id) {
      const group = await query('SELECT id FROM groups WHERE id = $1 AND active = true', [
        data.group_id,
      ]);
      if (group.rows.length === 0) {
        throw new AppError('קבוצה לא נמצאה', 400);
      }
    }

    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (data.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(data.email.toLowerCase());
    }
    if (data.first_name !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      params.push(data.first_name);
    }
    if (data.last_name !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      params.push(data.last_name);
    }
    if (data.role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      params.push(data.role);
    }
    if (data.group_id !== undefined) {
      updates.push(`group_id = $${paramIndex++}`);
      params.push(data.group_id);
    }
    if (data.active !== undefined) {
      updates.push(`active = $${paramIndex++}`);
      params.push(data.active);
    }

    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) {
      return this.getUserById(userId);
    }

    params.push(userId);
    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`, params);

    return this.getUserById(userId);
  },

  async deactivateUser(userId: number) {
    const existing = await query('SELECT id FROM users WHERE id = $1', [userId]);
    if (existing.rows.length === 0) {
      throw new AppError('משתמש לא נמצא', 404);
    }

    await query('UPDATE users SET active = false, updated_at = NOW() WHERE id = $1', [userId]);
  },

  async setPassword(userId: number, newPassword: string) {
    const passwordHash = await authService.hashPassword(newPassword);
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      passwordHash,
      userId,
    ]);
  },
};
