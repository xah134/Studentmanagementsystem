import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import requireAuth from '../middleware/requireAuth.js';
import requireRole from '../middleware/requireRole.js';
import { Role } from '../types/user.js';

const userRoutes = Router();

userRoutes.get('/', requireAuth, requireRole(Role.SYSTEM_ADMIN), UserController.list);
userRoutes.post('/', UserController.create);
userRoutes.patch('/:id', UserController.update);

export default userRoutes;
