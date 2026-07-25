import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller';
import { auth } from '../middlewares/auth';
import { authorize } from '../middlewares/role';
import { validate } from '../middlewares/validation';
import {
  createLeadSchema,
  updateLeadSchema,
  updateStatusSchema,
  assignLeadSchema,
} from '../validators/lead.validator';
import noteRoutes from './note.routes';
import activityRoutes from './activity.routes';

const router = Router();
const controller = new LeadController();

// Public route for lead creation
router.post('/public', validate(createLeadSchema), controller.createPublicLead);

router.use(auth);

// Mount note and activity child routers
router.use('/:id/notes', noteRoutes);
router.use('/:id/activity', activityRoutes);

router.get('/', controller.getLeads);
router.get('/:id', controller.getLeadById);
router.post('/', validate(createLeadSchema), controller.createLead);
router.patch('/:id', validate(updateLeadSchema), controller.updateLead);
router.delete('/:id', authorize('ADMIN'), controller.deleteLead);
router.patch('/:id/status', validate(updateStatusSchema), controller.updateStatus);
router.patch('/:id/assign', authorize('ADMIN'), validate(assignLeadSchema), controller.assignLead);

export default router;
