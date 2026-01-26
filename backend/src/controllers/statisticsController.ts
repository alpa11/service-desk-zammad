import { Request, Response, NextFunction } from 'express';
import { statisticsService } from '../services/statisticsService';

export const statisticsController = {
  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        from_date: req.query.from_date as string | undefined,
        to_date: req.query.to_date as string | undefined,
        branch_id: req.query.branch_id ? parseInt(req.query.branch_id as string, 10) : undefined,
        housekeeper_id: req.query.housekeeper_id
          ? parseInt(req.query.housekeeper_id as string, 10)
          : undefined,
      };

      const stats = await statisticsService.getStatistics(filters);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await statisticsService.getMyDashboard(req.user!.userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};
