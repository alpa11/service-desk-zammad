import { Router } from 'express';
import { body, param } from 'express-validator';
import { issueTypeController } from '../controllers/issueTypeController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

// Get all issue types
router.get('/', issueTypeController.getIssueTypes);

// Create issue type (admin only)
router.post(
  '/',
  authorize('admin'),
  validate([
    body('code').notEmpty().withMessage('קוד נדרש'),
    body('name').notEmpty().withMessage('שם נדרש'),
    body('category').optional().isString(),
    body('display_order').optional().isInt(),
  ]),
  issueTypeController.createIssueType
);

// Update issue type (admin only)
router.put(
  '/:id',
  authorize('admin'),
  validate([
    param('id').isInt().withMessage('מזהה לא תקין'),
    body('code').optional().notEmpty(),
    body('name').optional().notEmpty(),
    body('category').optional().isString(),
    body('display_order').optional().isInt(),
  ]),
  issueTypeController.updateIssueType
);

// Delete (deactivate) issue type (admin only)
router.delete(
  '/:id',
  authorize('admin'),
  validate([param('id').isInt().withMessage('מזהה לא תקין')]),
  issueTypeController.deleteIssueType
);

export default router;
