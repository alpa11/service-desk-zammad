import { Request, Response, NextFunction } from 'express';
import { branchService } from '../services/branchService';

export const branchController = {
  async getBranches(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        active: req.query.active !== undefined ? req.query.active === 'true' : undefined,
        housekeeper_id: req.query.housekeeper_id
          ? parseInt(req.query.housekeeper_id as string, 10)
          : undefined,
        search: req.query.search as string | undefined,
      };

      const branches = await branchService.getBranches(filters);

      res.json({
        success: true,
        data: branches,
      });
    } catch (error) {
      next(error);
    }
  },

  async getBranchById(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = parseInt(req.params.id, 10);
      const branch = await branchService.getBranchById(branchId);

      res.json({
        success: true,
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  },

  async createBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const branch = await branchService.createBranch(req.body);

      res.status(201).json({
        success: true,
        data: branch,
        message: 'הסניף נוצר בהצלחה',
      });
    } catch (error) {
      next(error);
    }
  },

  async updateBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = parseInt(req.params.id, 10);
      const branch = await branchService.updateBranch(branchId, req.body);

      res.json({
        success: true,
        data: branch,
        message: 'הסניף עודכן בהצלחה',
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = parseInt(req.params.id, 10);
      await branchService.deactivateBranch(branchId);

      res.json({
        success: true,
        message: 'הסניף בוטל',
      });
    } catch (error) {
      next(error);
    }
  },
};
