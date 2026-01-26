import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { query } from '../config/database';
import { authConfig } from '../config/auth';
import { User, JwtPayload } from '../types';
import { AppError } from '../middleware/errorHandler';

export const authService = {
  async login(email: string, password: string) {
    const result = await query(
      `SELECT id, email, password_hash, first_name, last_name, role, group_id, active
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new AppError('אימייל או סיסמה שגויים', 401);
    }

    const user = result.rows[0] as User;

    if (!user.active) {
      throw new AppError('המשתמש אינו פעיל', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('אימייל או סיסמה שגויים', 401);
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, authConfig.jwtSecret, {
      expiresIn: authConfig.jwtExpiry as SignOptions['expiresIn'],
    });

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Get group name if exists
    let groupName = null;
    if (user.group_id) {
      const groupResult = await query('SELECT name FROM groups WHERE id = $1', [user.group_id]);
      if (groupResult.rows.length > 0) {
        groupName = groupResult.rows[0].name;
      }
    }

    return {
      token,
      expires_at: expiresAt.toISOString(),
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        group_id: user.group_id,
        group_name: groupName,
      },
    };
  },

  async getUserById(userId: number) {
    const result = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.group_id, u.active,
              g.name as group_name
       FROM users u
       LEFT JOIN groups g ON u.group_id = g.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('משתמש לא נמצא', 404);
    }

    const user = result.rows[0];

    const permissions = {
      can_create_ticket: user.role === 'secretary',
      can_view_all_tickets: user.role === 'admin',
      can_manage_users: user.role === 'admin',
      can_manage_branches: user.role === 'admin',
    };

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      group_id: user.group_id,
      group_name: user.group_name,
      permissions,
    };
  },

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, authConfig.saltRounds);
  },

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      throw new AppError('משתמש לא נמצא', 404);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isPasswordValid) {
      throw new AppError('הסיסמה הנוכחית שגויה', 400);
    }

    const newHash = await this.hashPassword(newPassword);
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      newHash,
      userId,
    ]);

    return { message: 'הסיסמה שונתה בהצלחה' };
  },
};
