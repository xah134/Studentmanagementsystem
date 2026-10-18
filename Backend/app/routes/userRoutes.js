import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import requireAuth from '../middleware/requireAuth.js';

const userRoutes = Router();

userRoutes.get('/', requireAuth, UserController.list);
userRoutes.post('/', UserController.create);

export default userRoutes;
