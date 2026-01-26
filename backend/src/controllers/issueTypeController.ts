import { Request, Response, NextFunction } from 'express';
import { issueTypeService } from '../services/issueTypeService';

export const issueTypeController = {
  async getIssueTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const activeOnly = req.query.active !== 'false';
      const issueTypes = await issueTypeService.getIssueTypes(activeOnly);

      res.json({
        success: true,
        data: issueTypes,
      });
    } catch (error) {
      next(error);
    }
  },

  async createIssueType(req: Request, res: Response, next: NextFunction) {
    try {
      const issueType = await issueTypeService.createIssueType(req.body);

      res.status(201).json({
        success: true,
        data: issueType,
        message: 'סוג התקלה נוצר בהצלחה',
      });
    } catch (error) {
      next(error);
    }
  },

  async updateIssueType(req: Request, res: Response, next: NextFunction) {
    try {
      const issueTypeId = parseInt(req.params.id, 10);
      const issueType = await issueTypeService.updateIssueType(issueTypeId, req.body);

      res.json({
        success: true,
        data: issueType,
        message: 'סוג התקלה עודכן בהצלחה',
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteIssueType(req: Request, res: Response, next: NextFunction) {
    try {
      const issueTypeId = parseInt(req.params.id, 10);
      await issueTypeService.deactivateIssueType(issueTypeId);

      res.json({
        success: true,
        message: 'סוג התקלה בוטל',
      });
    } catch (error) {
      next(error);
    }
  },
};
