import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { auth } from '../middlewares/auth';

const router = Router({ mergeParams: true });
const controller = new ActivityController();

router.use(auth);

// Mounted at /leads/:id/activity
router.get('/', controller.getActivitiesByLeadId);

export default router;
