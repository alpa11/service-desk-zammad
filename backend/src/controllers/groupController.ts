import { Request, Response, NextFunction } from 'express';
import { groupService } from '../services/groupService';

export const groupController = {
  async getGroups(_req: Request, res: Response, next: NextFunction) {
    try {
      const groups = await groupService.getGroups();

      res.json({
        success: true,
        data: groups,
      });
    } catch (error) {
      next(error);
    }
  },

  async createGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const group = await groupService.createGroup(name);

      res.status(201).json({
        success: true,
        data: group,
        message: 'הקבוצה נוצרה בהצלחה',
      });
    } catch (error) {
      next(error);
    }
  },

  async updateGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = parseInt(req.params.id, 10);
      const { name } = req.body;
      const group = await groupService.updateGroup(groupId, name);

      res.json({
        success: true,
        data: group,
        message: 'הקבוצה עודכנה בהצלחה',
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = parseInt(req.params.id, 10);
      await groupService.deactivateGroup(groupId);

      res.json({
        success: true,
        message: 'הקבוצה בוטלה',
      });
    } catch (error) {
      next(error);
    }
  },
};
