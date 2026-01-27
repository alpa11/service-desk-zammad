import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { UserRole } from '../types';
import { parsePagination } from '../utils/helpers';

export const userController = {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        role: req.query.role as UserRole | undefined,
        active: req.query.active !== undefined ? req.query.active === 'true' : undefined,
        group_id: req.query.group_id ? parseInt(req.query.group_id as string, 10) : undefined,
        search: req.query.search as string | undefined,
      };

      const pagination = parsePagination(
        req.query.page as string | undefined,
        req.query.per_page as string | undefined
      );

      const result = await userService.getUsers(filters, pagination);

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await userService.getUserById(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);

      res.status(201).json({
        success: true,
        data: user,
        message: 'המשתמש נוצר בהצלחה',
      });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await userService.updateUser(userId, req.body);

      res.json({
        success: true,
        data: user,
        message: 'המשתמש עודכן בהצלחה',
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id, 10);
      await userService.deactivateUser(userId);

      res.json({
        success: true,
        message: 'המשתמש בוטל',
      });
    } catch (error) {
      next(error);
    }
  },

  async setPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id, 10);
      const { current_password, new_password } = req.body;

      // If admin is changing another user's password, no current password needed
      if (req.user!.role === 'admin' && req.user!.userId !== userId) {
        await userService.setPassword(userId, new_password);
      } else {
        // User changing their own password
        await authService.changePassword(userId, current_password, new_password);
      }

      res.json({
        success: true,
        message: 'הסיסמה שונתה בהצלחה',
      });
    } catch (error) {
      next(error);
    }
  },
};
