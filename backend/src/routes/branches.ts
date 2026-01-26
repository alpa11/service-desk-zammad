import { Router } from 'express';
import { body, param } from 'express-validator';
import { branchController } from '../controllers/branchController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

// Get all branches
router.get('/', branchController.getBranches);

// Get single branch
router.get(
  '/:id',
  validate([param('id').isInt().withMessage('מזהה סניף לא תקין')]),
  branchController.getBranchById
);

// Create branch (admin only)
router.post(
  '/',
  authorize('admin'),
  validate([
    body('name').notEmpty().withMessage('שם סניף נדרש'),
    body('code').notEmpty().withMessage('קוד סניף נדרש'),
    body('housekeeper_id').isInt().withMessage('אב בית נדרש'),
    body('has_floors').optional().isBoolean(),
    body('has_buildings').optional().isBoolean(),
    body('has_wings').optional().isBoolean(),
    body('floor_options').optional().isArray(),
    body('building_options').optional().isArray(),
    body('wing_options').optional().isArray(),
  ]),
  branchController.createBranch
);

// Update branch (admin only)
router.put(
  '/:id',
  authorize('admin'),
  validate([
    param('id').isInt().withMessage('מזהה סניף לא תקין'),
    body('name').optional().notEmpty(),
    body('code').optional().notEmpty(),
    body('housekeeper_id').optional().isInt(),
    body('has_floors').optional().isBoolean(),
    body('has_buildings').optional().isBoolean(),
    body('has_wings').optional().isBoolean(),
  ]),
  branchController.updateBranch
);

// Delete (deactivate) branch (admin only)
router.delete(
  '/:id',
  authorize('admin'),
  validate([param('id').isInt().withMessage('מזהה סניף לא תקין')]),
  branchController.deleteBranch
);

export default router;
