import { Router } from 'express';
import { body, param } from 'express-validator';
import { userController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

// Get all users
router.get('/', userController.getUsers);

// Get single user
router.get(
  '/:id',
  validate([param('id').isInt().withMessage('מזהה משתמש לא תקין')]),
  userController.getUserById
);

// Create user
router.post(
  '/',
  validate([
    body('email').isEmail().withMessage('כתובת אימייל לא תקינה'),
    body('password').isLength({ min: 8 }).withMessage('סיסמה חייבת להכיל לפחות 8 תווים'),
    body('first_name').notEmpty().withMessage('שם פרטי נדרש'),
    body('last_name').notEmpty().withMessage('שם משפחה נדרש'),
    body('role')
      .isIn(['secretary', 'housekeeper', 'technician', 'admin'])
      .withMessage('תפקיד לא תקין'),
    body('group_id').optional().isInt(),
  ]),
  userController.createUser
);

// Update user
router.put(
  '/:id',
  validate([
    param('id').isInt().withMessage('מזהה משתמש לא תקין'),
    body('email').optional().isEmail(),
    body('first_name').optional().notEmpty(),
    body('last_name').optional().notEmpty(),
    body('role').optional().isIn(['secretary', 'housekeeper', 'technician', 'admin']),
    body('group_id').optional().isInt(),
    body('active').optional().isBoolean(),
  ]),
  userController.updateUser
);

// Delete (deactivate) user
router.delete(
  '/:id',
  validate([param('id').isInt().withMessage('מזהה משתמש לא תקין')]),
  userController.deleteUser
);

// Set password
router.post(
  '/:id/password',
  validate([
    param('id').isInt().withMessage('מזהה משתמש לא תקין'),
    body('new_password').isLength({ min: 8 }).withMessage('סיסמה חייבת להכיל לפחות 8 תווים'),
  ]),
  userController.setPassword
);

export default router;
