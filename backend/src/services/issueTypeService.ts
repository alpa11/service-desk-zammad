import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface CreateIssueTypeData {
  code: string;
  name: string;
  category?: string;
  display_order?: number;
}

export const issueTypeService = {
  async getIssueTypes(activeOnly: boolean = true) {
    const whereClause = activeOnly ? 'WHERE active = true' : '';

    const result = await query(
      `SELECT * FROM issue_types ${whereClause} ORDER BY display_order, name`
    );

    return result.rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      category: row.category,
      active: row.active,
      display_order: row.display_order,
    }));
  },

  async createIssueType(data: CreateIssueTypeData) {
    const existing = await query('SELECT id FROM issue_types WHERE code = $1', [data.code]);
    if (existing.rows.length > 0) {
      throw new AppError('קוד סוג תקלה כבר קיים', 400);
    }

    const result = await query(
      `INSERT INTO issue_types (code, name, category, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.code, data.name, data.category || null, data.display_order || 0]
    );

    return result.rows[0];
  },

  async updateIssueType(issueTypeId: number, data: Partial<CreateIssueTypeData>) {
    const existing = await query('SELECT id FROM issue_types WHERE id = $1', [issueTypeId]);
    if (existing.rows.length === 0) {
      throw new AppError('סוג תקלה לא נמצא', 404);
    }

    if (data.code) {
      const codeCheck = await query('SELECT id FROM issue_types WHERE code = $1 AND id != $2', [
        data.code,
        issueTypeId,
      ]);
      if (codeCheck.rows.length > 0) {
        throw new AppError('קוד סוג תקלה כבר קיים', 400);
      }
    }

    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (data.code !== undefined) {
      updates.push(`code = $${paramIndex++}`);
      params.push(data.code);
    }
    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }
    if (data.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      params.push(data.category);
    }
    if (data.display_order !== undefined) {
      updates.push(`display_order = $${paramIndex++}`);
      params.push(data.display_order);
    }

    if (updates.length === 0) {
      const result = await query('SELECT * FROM issue_types WHERE id = $1', [issueTypeId]);
      return result.rows[0];
    }

    params.push(issueTypeId);
    const result = await query(
      `UPDATE issue_types SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    return result.rows[0];
  },

  async deactivateIssueType(issueTypeId: number) {
    const existing = await query('SELECT id FROM issue_types WHERE id = $1', [issueTypeId]);
    if (existing.rows.length === 0) {
      throw new AppError('סוג תקלה לא נמצא', 404);
    }

    await query('UPDATE issue_types SET active = false WHERE id = $1', [issueTypeId]);
  },
};
