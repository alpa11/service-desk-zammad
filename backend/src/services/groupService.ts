import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const groupService = {
  async getGroups() {
    const result = await query(
      `SELECT
        g.*,
        COUNT(u.id) as members_count
      FROM groups g
      LEFT JOIN users u ON u.group_id = g.id AND u.active = true
      WHERE g.active = true
      GROUP BY g.id
      ORDER BY g.name`
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      active: row.active,
      members_count: parseInt(row.members_count, 10),
    }));
  },

  async createGroup(name: string) {
    const existing = await query('SELECT id FROM groups WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      throw new AppError('שם קבוצה כבר קיים', 400);
    }

    const result = await query('INSERT INTO groups (name) VALUES ($1) RETURNING *', [name]);
    return result.rows[0];
  },

  async updateGroup(groupId: number, name: string) {
    const existing = await query('SELECT id FROM groups WHERE id = $1', [groupId]);
    if (existing.rows.length === 0) {
      throw new AppError('קבוצה לא נמצאה', 404);
    }

    const nameCheck = await query('SELECT id FROM groups WHERE name = $1 AND id != $2', [
      name,
      groupId,
    ]);
    if (nameCheck.rows.length > 0) {
      throw new AppError('שם קבוצה כבר קיים', 400);
    }

    const result = await query('UPDATE groups SET name = $1 WHERE id = $2 RETURNING *', [
      name,
      groupId,
    ]);
    return result.rows[0];
  },

  async deactivateGroup(groupId: number) {
    const existing = await query('SELECT id FROM groups WHERE id = $1', [groupId]);
    if (existing.rows.length === 0) {
      throw new AppError('קבוצה לא נמצאה', 404);
    }

    await query('UPDATE groups SET active = false WHERE id = $1', [groupId]);
  },
};
