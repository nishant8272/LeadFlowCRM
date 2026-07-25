import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { auth } from '../middlewares/auth';
import { authorize } from '../middlewares/role';
import { validate } from '../middlewares/validation';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';

const router = Router();
const controller = new UserController();

// All user management routes require ADMIN role
router.use(auth, authorize('ADMIN'));

router.get('/', controller.getAllUsers);
router.post('/', validate(createUserSchema), controller.createUser);
router.patch('/:id', validate(updateUserSchema), controller.updateUser);
router.delete('/:id', controller.deleteUser);

export default router;
