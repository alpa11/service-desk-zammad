import { Router } from 'express';
import { body, param } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ticketController } from '../controllers/ticketController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const ticketId = req.params.id;
    const dir = `./uploads/tickets/${ticketId}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// All routes require authentication
router.use(authenticate);

// Get all tickets (filtered by role)
router.get('/', ticketController.getTickets);

// Get single ticket
router.get(
  '/:id',
  validate([param('id').isInt().withMessage('מזהה קריאה לא תקין')]),
  ticketController.getTicketById
);

// Create ticket (secretary only)
router.post(
  '/',
  authorize('secretary'),
  validate([
    body('branch_id').isInt().withMessage('סניף נדרש'),
    body('issue_type_id').isInt().withMessage('סוג תקלה נדרש'),
    body('description')
      .isLength({ min: 5, max: 1000 })
      .withMessage('תיאור חייב להכיל בין 5 ל-1000 תווים'),
    body('floor').optional().isString(),
    body('building').optional().isString(),
    body('wing').optional().isString(),
    body('room').optional().isString().isLength({ max: 50 }),
  ]),
  ticketController.createTicket
);

// Update ticket status (housekeeper, technician, admin)
router.patch(
  '/:id/status',
  authorize('housekeeper', 'technician', 'admin'),
  validate([
    param('id').isInt().withMessage('מזהה קריאה לא תקין'),
    body('status').isIn(['open', 'in_progress', 'closed']).withMessage('סטטוס לא תקין'),
  ]),
  ticketController.updateStatus
);

// Update internal note
router.patch(
  '/:id/note',
  authorize('housekeeper', 'technician', 'admin'),
  validate([
    param('id').isInt().withMessage('מזהה קריאה לא תקין'),
    body('internal_note').optional().isString().isLength({ max: 1000 }),
  ]),
  ticketController.updateNote
);

// Upload photo
router.post(
  '/:id/photos',
  authorize('housekeeper', 'technician', 'admin'),
  validate([param('id').isInt().withMessage('מזהה קריאה לא תקין')]),
  upload.single('photo'),
  ticketController.uploadPhoto
);

// Delete photo
router.delete(
  '/:id/photos/:photo_id',
  authorize('housekeeper', 'technician', 'admin'),
  validate([
    param('id').isInt().withMessage('מזהה קריאה לא תקין'),
    param('photo_id').isInt().withMessage('מזהה תמונה לא תקין'),
  ]),
  ticketController.deletePhoto
);

export default router;
