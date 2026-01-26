import { Router } from 'express';
import { body, param } from 'express-validator';
import { groupController } from '../controllers/groupController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

// Get all groups
router.get('/', groupController.getGroups);

// Create group
router.post(
  '/',
  validate([body('name').notEmpty().withMessage('שם קבוצה נדרש')]),
  groupController.createGroup
);

// Update group
router.put(
  '/:id',
  validate([
    param('id').isInt().withMessage('מזהה קבוצה לא תקין'),
    body('name').notEmpty().withMessage('שם קבוצה נדרש'),
  ]),
  groupController.updateGroup
);

// Delete (deactivate) group
router.delete(
  '/:id',
  validate([param('id').isInt().withMessage('מזהה קבוצה לא תקין')]),
  groupController.deleteGroup
);

export default router;
