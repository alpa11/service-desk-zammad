import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('כתובת אימייל לא תקינה'),
    body('password').notEmpty().withMessage('סיסמה נדרשת'),
  ]),
  authController.login
);

router.post('/logout', authenticate, authController.logout);

router.get('/me', authenticate, authController.me);

router.post(
  '/change-password',
  authenticate,
  validate([
    body('current_password').notEmpty().withMessage('סיסמה נוכחית נדרשת'),
    body('new_password')
      .isLength({ min: 8 })
      .withMessage('הסיסמה החדשה חייבת להכיל לפחות 8 תווים'),
  ]),
  authController.changePassword
);

export default router;
