import { Request, Response, NextFunction } from 'express';
import { ticketService } from '../services/ticketService';
import { parsePagination } from '../utils/helpers';
import { TicketStatus } from '../types';
import fs from 'fs';
import path from 'path';

export const ticketController = {
  async getTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(
        req.query.page as string,
        req.query.per_page as string
      );

      const filters = {
        status: req.query.status as TicketStatus | undefined,
        branch_id: req.query.branch_id ? parseInt(req.query.branch_id as string, 10) : undefined,
        housekeeper_id: req.query.housekeeper_id
          ? parseInt(req.query.housekeeper_id as string, 10)
          : undefined,
        issue_type_id: req.query.issue_type_id
          ? parseInt(req.query.issue_type_id as string, 10)
          : undefined,
        from_date: req.query.from_date as string | undefined,
        to_date: req.query.to_date as string | undefined,
      };

      const result = await ticketService.getTickets(
        req.user!.userId,
        req.user!.role,
        filters,
        pagination
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getTicketById(req: Request, res: Response, next: NextFunction) {
    try {
      const ticketId = parseInt(req.params.id, 10);
      const ticket = await ticketService.getTicketById(
        ticketId,
        req.user!.userId,
        req.user!.role
      );

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  },

  async createTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        branch_id: req.body.branch_id,
        issue_type_id: req.body.issue_type_id,
        description: req.body.description,
        floor: req.body.floor,
        building: req.body.building,
        wing: req.body.wing,
        room: req.body.room,
        created_by: req.user!.userId,
      };

      const ticket = await ticketService.createTicket(data);

      res.status(201).json({
        success: true,
        data: ticket,
        message: 'הקריאה נפתחה בהצלחה',
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const ticketId = parseInt(req.params.id, 10);
      const { status } = req.body;

      const result = await ticketService.updateTicketStatus(
        ticketId,
        status,
        req.user!.userId,
        req.user!.role
      );

      res.json({
        success: true,
        data: result,
        message: 'הסטטוס עודכן בהצלחה',
      });
    } catch (error) {
      next(error);
    }
  },

  async updateNote(req: Request, res: Response, next: NextFunction) {
    try {
      const ticketId = parseInt(req.params.id, 10);
      const { internal_note } = req.body;

      const result = await ticketService.updateTicketNote(
        ticketId,
        internal_note,
        req.user!.userId,
        req.user!.role
      );

      res.json({
        success: true,
        data: result,
        message: 'ההערה נשמרה',
      });
    } catch (error) {
      next(error);
    }
  },

  async uploadPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const ticketId = parseInt(req.params.id, 10);
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'לא נבחר קובץ',
        });
        return;
      }

      const photo = await ticketService.addPhoto(
        ticketId,
        file.path,
        file.originalname,
        file.size,
        file.mimetype,
        req.user!.userId
      );

      res.status(201).json({
        success: true,
        data: photo,
        message: 'התמונה הועלתה בהצלחה',
      });
    } catch (error) {
      next(error);
    }
  },

  async deletePhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const photoId = parseInt(req.params.photo_id, 10);

      const result = await ticketService.deletePhoto(
        photoId,
        req.user!.userId,
        req.user!.role
      );

      // Delete file from disk
      try {
        fs.unlinkSync(result.file_path);
      } catch {
        // File might not exist, continue anyway
      }

      res.json({
        success: true,
        message: 'התמונה נמחקה',
      });
    } catch (error) {
      next(error);
    }
  },
};
