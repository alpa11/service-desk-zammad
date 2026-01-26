import { Router } from 'express';
import { statisticsController } from '../controllers/statisticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get overall statistics (admin only)
router.get('/', authorize('admin'), statisticsController.getStatistics);

// Get personal dashboard (housekeeper, technician)
router.get(
  '/my-dashboard',
  authorize('housekeeper', 'technician'),
  statisticsController.getMyDashboard
);

export default router;
