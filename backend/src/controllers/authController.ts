import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(_req: Request, res: Response) {
    res.json({
      success: true,
      message: 'התנתקת בהצלחה',
    });
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getUserById(req.user!.userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { current_password, new_password } = req.body;
      const result = await authService.changePassword(
        req.user!.userId,
        current_password,
        new_password
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};
