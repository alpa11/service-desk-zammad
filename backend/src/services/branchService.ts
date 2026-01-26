import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface CreateBranchData {
  name: string;
  code: string;
  housekeeper_id: number;
  has_floors?: boolean;
  has_buildings?: boolean;
  has_wings?: boolean;
  floor_options?: string[];
  building_options?: string[];
  wing_options?: string[];
}

export const branchService = {
  async getBranches(filters: { active?: boolean; housekeeper_id?: number; search?: string }) {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters.active !== undefined) {
      conditions.push(`b.active = $${paramIndex++}`);
      params.push(filters.active);
    }
    if (filters.housekeeper_id) {
      conditions.push(`b.housekeeper_id = $${paramIndex++}`);
      params.push(filters.housekeeper_id);
    }
    if (filters.search) {
      conditions.push(`(b.name ILIKE $${paramIndex} OR b.code ILIKE $${paramIndex})`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT
        b.*,
        u.first_name || ' ' || u.last_name as housekeeper_name,
        (SELECT COUNT(*) FROM tickets t WHERE t.branch_id = b.id AND t.status = 'open') as open_tickets
      FROM branches b
      JOIN users u ON b.housekeeper_id = u.id
      ${whereClause}
      ORDER BY b.name`,
      params
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      has_floors: row.has_floors,
      has_buildings: row.has_buildings,
      has_wings: row.has_wings,
      floor_options: row.floor_options,
      building_options: row.building_options,
      wing_options: row.wing_options,
      active: row.active,
      housekeeper: {
        id: row.housekeeper_id,
        name: row.housekeeper_name,
      },
      open_tickets: parseInt(row.open_tickets, 10),
    }));
  },

  async getBranchById(branchId: number) {
    const result = await query(
      `SELECT
        b.*,
        u.first_name || ' ' || u.last_name as housekeeper_name
      FROM branches b
      JOIN users u ON b.housekeeper_id = u.id
      WHERE b.id = $1`,
      [branchId]
    );

    if (result.rows.length === 0) {
      throw new AppError('סניף לא נמצא', 404);
    }

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      has_floors: row.has_floors,
      has_buildings: row.has_buildings,
      has_wings: row.has_wings,
      floor_options: row.floor_options,
      building_options: row.building_options,
      wing_options: row.wing_options,
      active: row.active,
      housekeeper: {
        id: row.housekeeper_id,
        name: row.housekeeper_name,
      },
    };
  },

  async createBranch(data: CreateBranchData) {
    // Check if code already exists
    const existing = await query('SELECT id FROM branches WHERE code = $1', [data.code]);
    if (existing.rows.length > 0) {
      throw new AppError('קוד סניף כבר קיים במערכת', 400);
    }

    // Verify housekeeper exists and has correct role
    const hk = await query("SELECT id FROM users WHERE id = $1 AND role = 'housekeeper' AND active = true", [
      data.housekeeper_id,
    ]);
    if (hk.rows.length === 0) {
      throw new AppError('אב בית לא נמצא או לא פעיל', 400);
    }

    const result = await query(
      `INSERT INTO branches (name, code, housekeeper_id, has_floors, has_buildings, has_wings,
                             floor_options, building_options, wing_options)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.name,
        data.code,
        data.housekeeper_id,
        data.has_floors || false,
        data.has_buildings || false,
        data.has_wings || false,
        data.floor_options ? JSON.stringify(data.floor_options) : null,
        data.building_options ? JSON.stringify(data.building_options) : null,
        data.wing_options ? JSON.stringify(data.wing_options) : null,
      ]
    );

    return this.getBranchById(result.rows[0].id);
  },

  async updateBranch(branchId: number, data: Partial<CreateBranchData>) {
    const existing = await query('SELECT id FROM branches WHERE id = $1', [branchId]);
    if (existing.rows.length === 0) {
      throw new AppError('סניף לא נמצא', 404);
    }

    // Check if code is being changed and if it's unique
    if (data.code) {
      const codeCheck = await query('SELECT id FROM branches WHERE code = $1 AND id != $2', [
        data.code,
        branchId,
      ]);
      if (codeCheck.rows.length > 0) {
        throw new AppError('קוד סניף כבר קיים במערכת', 400);
      }
    }

    if (data.housekeeper_id) {
      const hk = await query(
        "SELECT id FROM users WHERE id = $1 AND role = 'housekeeper' AND active = true",
        [data.housekeeper_id]
      );
      if (hk.rows.length === 0) {
        throw new AppError('אב בית לא נמצא או לא פעיל', 400);
      }
    }

    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }
    if (data.code !== undefined) {
      updates.push(`code = $${paramIndex++}`);
      params.push(data.code);
    }
    if (data.housekeeper_id !== undefined) {
      updates.push(`housekeeper_id = $${paramIndex++}`);
      params.push(data.housekeeper_id);
    }
    if (data.has_floors !== undefined) {
      updates.push(`has_floors = $${paramIndex++}`);
      params.push(data.has_floors);
    }
    if (data.has_buildings !== undefined) {
      updates.push(`has_buildings = $${paramIndex++}`);
      params.push(data.has_buildings);
    }
    if (data.has_wings !== undefined) {
      updates.push(`has_wings = $${paramIndex++}`);
      params.push(data.has_wings);
    }
    if (data.floor_options !== undefined) {
      updates.push(`floor_options = $${paramIndex++}`);
      params.push(data.floor_options ? JSON.stringify(data.floor_options) : null);
    }
    if (data.building_options !== undefined) {
      updates.push(`building_options = $${paramIndex++}`);
      params.push(data.building_options ? JSON.stringify(data.building_options) : null);
    }
    if (data.wing_options !== undefined) {
      updates.push(`wing_options = $${paramIndex++}`);
      params.push(data.wing_options ? JSON.stringify(data.wing_options) : null);
    }

    if (updates.length === 0) {
      return this.getBranchById(branchId);
    }

    params.push(branchId);
    await query(`UPDATE branches SET ${updates.join(', ')} WHERE id = $${paramIndex}`, params);

    return this.getBranchById(branchId);
  },

  async deactivateBranch(branchId: number) {
    const existing = await query('SELECT id FROM branches WHERE id = $1', [branchId]);
    if (existing.rows.length === 0) {
      throw new AppError('סניף לא נמצא', 404);
    }

    await query('UPDATE branches SET active = false WHERE id = $1', [branchId]);
  },
};
